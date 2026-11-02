"""Unit tests for Verifin's dynamic NetworkX Orchestrator and incremental re-planning."""

import asyncio
import time
import pytest
from backend.app.stages import get_all_standard_stages, RunContext
from backend.app.orchestrator.planner import DAGPlanner
from backend.app.orchestrator.runner import OrchestratorRunner
from backend.app.orchestrator.events import OrchestratorEvent, OrchestratorEventType
from backend.app.synthetic.generator import generate_scenario, add_new_evidence_to_sharma
from backend.app.core.casefile import StageStatus, Finding, FindingSeverity


def test_parallel_waves_faster_than_sequential(caplog):
    """Proves parallel wave concurrency is faster than sequential execution on the same case."""
    async def _run():
        stages = get_all_standard_stages()
        planner = DAGPlanner(stages)
        runner = OrchestratorRunner(planner=planner)

        # Case 1: Parallel waves
        case_parallel = generate_scenario("clean_file", seed=42)
        ctx_parallel = RunContext(case_id=case_parallel.case_id, metadata={"simulated_delay_s": 0.02})

        t0_parallel = time.perf_counter()
        await runner.execute_case(case_parallel, ctx=ctx_parallel)
        dur_parallel = time.perf_counter() - t0_parallel

        # Case 2: Sequential execution
        case_seq = generate_scenario("clean_file", seed=42)
        ctx_seq = RunContext(case_id=case_seq.case_id, metadata={"simulated_delay_s": 0.02})

        t0_seq = time.perf_counter()
        await runner.execute_case_sequential(case_seq, ctx=ctx_seq)
        dur_seq = time.perf_counter() - t0_seq

        print(f"\n[TIMING BENCHMARK] Parallel waves: {dur_parallel*1000:.1f}ms | Sequential: {dur_seq*1000:.1f}ms")
        # With 11 stages and 2 parallel waves (wave 1: 2 stages, wave 3: 2 stages),
        # parallel wave count is 9 stages long instead of 11.
        # Parallel must finish in less time than sequential.
        assert dur_parallel < dur_seq

    asyncio.run(_run())


def test_wave_grouping_concurrency():
    """Verify that independent stages are grouped into parallel waves via NetworkX."""
    stages = get_all_standard_stages()
    planner = DAGPlanner(stages)
    waves = planner.waves()

    # Wave 1 must group intake and bureau_kyc together
    assert "intake" in waves[0]
    assert "bureau_kyc" in waves[0]
    assert len(waves[0]) == 2

    # Wave 2 is Trust Gate
    assert waves[1] == ["trust_gate"]

    # Wave 3 must group cashflow and fraud together
    assert "cashflow" in waves[2]
    assert "fraud" in waves[2]
    assert len(waves[2]) == 2

    # Total 11 stages distributed across 9 topological waves
    assert len(waves) == 9
    total_nodes = sum(len(w) for w in waves)
    assert total_nodes == 11


def test_incremental_replan_counts_derived_from_graph():
    """Verify that redo (7) and reuse (4) counts are derived directly from NetworkX.
    
    When electricity bills are added to Sharma Traders, cashflow inputs change:
    - 4 upstream stages are preserved as CACHED: intake, bureau_kyc, trust_gate, fraud
    - 7 downstream stages are invalidated as STALE: cashflow, risk, policy, structuring, cam, ledger, human
    """
    stages = get_all_standard_stages()
    planner = DAGPlanner(stages)
    case = generate_scenario("sharma_traders", seed=42)

    # Initial plan
    planner.build_initial_plan(case)
    for rec in case.plan.stages.values():
        rec.status = StageStatus.COMPLETED

    # Trigger re-plan from cashflow stage (new evidence arrival)
    stale, reused = planner.trigger_replan(
        case=case,
        changed_node="cashflow",
        reason="Uploaded 12 months commercial electricity bills",
    )

    # Graph-derived counts: 7 recomputed, 4 reused
    assert len(stale) == 7
    assert len(reused) == 4

    expected_stale = {"cashflow", "risk", "policy", "structuring", "cam", "ledger", "human"}
    expected_reused = {"intake", "bureau_kyc", "trust_gate", "fraud"}

    assert set(stale) == expected_stale
    assert set(reused) == expected_reused

    # Verify history recorded
    assert len(case.plan.replan_history) == 1
    assert case.plan.replan_history[0].trigger_evidence == "cashflow"


def test_orchestrator_execution_and_replay_determinism():
    """Run an end-to-end execution of a case through all waves and verify bit-for-bit replay."""
    async def _run():
        stages = get_all_standard_stages()
        planner = DAGPlanner(stages)
        events: list[OrchestratorEvent] = []

        def on_event(evt: OrchestratorEvent):
            events.append(evt)

        runner = OrchestratorRunner(planner=planner, event_callback=on_event)
        case_1 = generate_scenario("sharma_traders", seed=42)

        # First run
        completed_case_1 = await runner.execute_case(case_1)
        hash_1 = completed_case_1.compute_state_hash()

        # Verify events
        types = [e.event_type for e in events]
        assert OrchestratorEventType.PLAN_BUILT in types
        assert OrchestratorEventType.WAVE_STARTED in types
        assert OrchestratorEventType.STAGE_FINISHED in types
        assert OrchestratorEventType.CASE_DONE in types

        # Replay on identical input
        case_2 = generate_scenario("sharma_traders", seed=42)
        completed_case_2 = await runner.execute_case(case_2)
        hash_2 = completed_case_2.compute_state_hash()

        # Deterministic replay guarantee
        assert hash_1 == hash_2

    asyncio.run(_run())


def test_early_exit_on_severe_flag():
    """A severe finding must halt downstream stages and route directly to human escalation."""
    async def _run():
        stages = get_all_standard_stages()
        planner = DAGPlanner(stages)
        events: list[OrchestratorEvent] = []

        runner = OrchestratorRunner(planner=planner, event_callback=lambda e: events.append(e))
        case = generate_scenario("clean_file", seed=42)

        # Inject a severe finding before execution
        case.add_finding(
            Finding(
                id="flag_severe_sanctions_hit",
                stage="intake",
                title="Entity on International Sanctions List",
                description="Severe AML match found.",
                severity=FindingSeverity.SEVERE,
                confidence=1.0,
                evidence_refs=["fact_gst_turnover_annual"],
            )
        )

        await runner.execute_case(case)

        # Verify early exit event was triggered
        types = [e.event_type for e in events]
        assert OrchestratorEventType.EARLY_EXIT in types

    asyncio.run(_run())
