"""Orchestrator Execution Runner for Verifin.

Executes DAG waves concurrently using asyncio.gather, manages deterministic result
merging, enforces budgets, handles input-hash caching, and triggers early-exit escalations.
"""

from __future__ import annotations

import asyncio
import time
from typing import AsyncGenerator, Callable, Dict, List, Optional
from backend.app.core.casefile import (
    CaseFile,
    DecisionStatus,
    FindingSeverity,
    StageStatus,
)
from backend.app.core.audit import AuditLogger, AuditEventType
from backend.app.core.budgets import CaseBudget
from backend.app.orchestrator.planner import DAGPlanner
from backend.app.orchestrator.events import OrchestratorEvent, OrchestratorEventType
from backend.app.stages.base import RunContext, StageResult


class OrchestratorRunner:
    """Executes loan cases through the planned DAG with wave concurrency."""

    def __init__(
        self,
        planner: DAGPlanner,
        audit_logger: Optional[AuditLogger] = None,
        event_callback: Optional[Callable[[OrchestratorEvent], None]] = None,
    ) -> None:
        self.planner = planner
        self.audit_logger = audit_logger or AuditLogger()
        self.event_callback = event_callback

    def _emit(self, event: OrchestratorEvent) -> None:
        if self.event_callback:
            self.event_callback(event)

    async def execute_case(
        self,
        case: CaseFile,
        ctx: Optional[RunContext] = None,
        budget: Optional[CaseBudget] = None,
    ) -> CaseFile:
        """Run complete case evaluation through parallel waves."""
        context = ctx or RunContext(case_id=case.case_id, active_policy_pack="bank_a")
        case_budget = budget or CaseBudget()

        if not case.plan or not case.plan.stages:
            self.planner.build_initial_plan(case)
        assert case.plan is not None

        self._emit(
            OrchestratorEvent(
                event_type=OrchestratorEventType.PLAN_BUILT,
                case_id=case.case_id,
                details={"waves": case.plan.waves, "stages": list(case.plan.stages.keys())},
            )
        )

        early_exit_triggered = False

        for wave_idx, wave in enumerate(case.plan.waves, start=1):
            if early_exit_triggered:
                break

            self._emit(
                OrchestratorEvent(
                    event_type=OrchestratorEventType.WAVE_STARTED,
                    case_id=case.case_id,
                    wave_index=wave_idx,
                    details={"wave_stages": wave},
                )
            )

            # Filter stages to execute in this wave
            stages_to_run: List[str] = []
            for stage_name in wave:
                stage = self.planner.stages.get(stage_name)
                if not stage:
                    continue

                rec = case.plan.stages.get(stage_name)
                if not stage.needed(case):
                    if rec:
                        rec.status = StageStatus.SKIPPED
                    self._emit(
                        OrchestratorEvent(
                            event_type=OrchestratorEventType.STAGE_SKIPPED,
                            case_id=case.case_id,
                            stage_name=stage_name,
                            details={"reason": "Not needed for case profile"},
                        )
                    )
                    continue

                current_hash = stage.input_hash(case)
                # Check for cached reuse
                if rec and rec.status == StageStatus.COMPLETED and rec.input_hash == current_hash:
                    self._emit(
                        OrchestratorEvent(
                            event_type=OrchestratorEventType.STAGE_REUSED,
                            case_id=case.case_id,
                            stage_name=stage_name,
                            details={"input_hash": current_hash, "saved_compute": True},
                        )
                    )
                    continue

                stages_to_run.append(stage_name)

            if not stages_to_run:
                continue

            # Execute wave concurrently using asyncio.gather
            async def _run_single_stage(name: str, delay: float = 0.0) -> StageResult:
                stg = self.planner.stages[name]
                case_budget.consume_tool_call()
                if delay > 0:
                    await asyncio.sleep(delay)

                self._emit(
                    OrchestratorEvent(
                        event_type=OrchestratorEventType.STAGE_STARTED,
                        case_id=case.case_id,
                        stage_name=name,
                    )
                )

                t0 = time.perf_counter()
                try:
                    result = await stg.run(case, context)
                except Exception as ex:
                    result = StageResult(
                        stage_name=name,
                        status=StageStatus.FAILED,
                        error_message=str(ex),
                    )

                dur_ms = (time.perf_counter() - t0) * 1000.0
                result.execution_time_ms = round(dur_ms, 2)
                return result

            # Run parallel coroutines
            sim_delay = context.metadata.get("simulated_delay_s", 0.0)
            results: List[StageResult] = await asyncio.gather(*[_run_single_stage(s, sim_delay) for s in stages_to_run])

            # Deterministic merge: sort results alphabetically by stage_name
            results.sort(key=lambda r: r.stage_name)

            for res in results:
                rec = case.plan.stages.get(res.stage_name)
                if rec:
                    rec.status = res.status
                    rec.output_hash = res.output_hash
                    rec.execution_time_ms = res.execution_time_ms
                    rec.input_hash = self.planner.stages[res.stage_name].input_hash(case)

                self.audit_logger.log(
                    case_id=case.case_id,
                    event_type=AuditEventType.STAGE_TRANSITION,
                    actor=res.stage_name,
                    action=f"Completed stage {res.stage_name}",
                    details={"output_hash": res.output_hash, "execution_time_ms": res.execution_time_ms},
                    latency_ms=res.execution_time_ms,
                )

                self._emit(
                    OrchestratorEvent(
                        event_type=OrchestratorEventType.STAGE_FINISHED,
                        case_id=case.case_id,
                        stage_name=res.stage_name,
                        details={"status": res.status, "output_hash": res.output_hash, "time_ms": res.execution_time_ms},
                    )
                )

                # Check for severe flag early exit
                severe_findings = [f for f in case.findings if f.severity == FindingSeverity.SEVERE]
                if severe_findings:
                    early_exit_triggered = True
                    first_severe = severe_findings[0]
                    self._emit(
                        OrchestratorEvent(
                            event_type=OrchestratorEventType.EARLY_EXIT,
                            case_id=case.case_id,
                            stage_name=res.stage_name,
                            details={"finding_id": first_severe.id, "reason": first_severe.description},
                        )
                    )
                    break

        case.bump_version()
        self._emit(
            OrchestratorEvent(
                event_type=OrchestratorEventType.CASE_DONE,
                case_id=case.case_id,
                details={"version": case.version, "early_exit": early_exit_triggered},
            )
        )
        return case

    async def execute_case_sequential(
        self,
        case: CaseFile,
        ctx: Optional[RunContext] = None,
    ) -> CaseFile:
        """Run all stages sequentially in a single linear chain for performance benchmarking."""
        context = ctx or RunContext(case_id=case.case_id, active_policy_pack="bank_a")
        sim_delay = context.metadata.get("simulated_delay_s", 0.0)

        for stage_name, stage in self.planner.stages.items():
            if not stage.needed(case):
                continue
            if sim_delay > 0:
                await asyncio.sleep(sim_delay)
            await stage.run(case, context)

        case.bump_version()
        return case
