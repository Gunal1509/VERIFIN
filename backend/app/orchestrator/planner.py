"""Dynamic NetworkX DAG Planner for Verifin.

Builds a per-case dependency graph, computes concurrent waves, manages input-hash
caching, and propagates stale invalidations upon new evidence arrival.
"""

from __future__ import annotations

import networkx as nx
from typing import Dict, List, Optional, Set, Tuple
from backend.app.core.casefile import (
    CaseFile,
    DAGPlan,
    StageExecutionRecord,
    StageStatus,
    ReplanEvent,
)
from backend.app.stages.base import Stage


class DAGPlanner:
    """Orchestrator planner managing the dynamic stage graph."""

    def __init__(self, stages: Optional[List[Stage]] = None) -> None:
        self.stages: Dict[str, Stage] = {}
        self.graph: nx.DiGraph = nx.DiGraph()
        if stages:
            for s in stages:
                self.register_stage(s)

    def register_stage(self, stage: Stage) -> None:
        """Register a stage and wire its dependency edges."""
        self.stages[stage.name] = stage
        self.graph.add_node(stage.name)
        for dep in stage.deps:
            self.graph.add_edge(dep, stage.name)

        if not nx.is_directed_acyclic_graph(self.graph):
            raise ValueError(f"Cycle detected after adding stage '{stage.name}'!")

    def waves(self) -> List[List[str]]:
        """Group registered stages into parallel execution waves using topological generations."""
        if not self.graph.nodes:
            return []
        generations = list(nx.topological_generations(self.graph))
        # Alphabetically sort each wave for deterministic ordering
        return [sorted(list(wave)) for wave in generations]

    def build_initial_plan(self, case: CaseFile) -> DAGPlan:
        """Construct the initial DAGPlan for a case."""
        waves = self.waves()
        plan_stages: Dict[str, StageExecutionRecord] = {}

        for stage_name, stage in self.stages.items():
            if not stage.needed(case):
                status = StageStatus.SKIPPED
            else:
                status = StageStatus.PENDING

            plan_stages[stage_name] = StageExecutionRecord(
                stage_name=stage_name,
                status=status,
                input_hash=stage.input_hash(case),
            )

        dag_plan = DAGPlan(
            stages=plan_stages,
            waves=waves,
            replan_history=[],
        )
        case.plan = dag_plan
        return dag_plan

    def trigger_replan(
        self,
        case: CaseFile,
        changed_node: str,
        reason: str,
    ) -> Tuple[List[str], List[str]]:
        """Perform topological descendant invalidation on new evidence.
        
        Derives redo and reuse counts directly from NetworkX traversal.
        """
        if not case.plan:
            self.build_initial_plan(case)
        assert case.plan is not None

        # Descendants that depend on changed_node
        descendants = nx.descendants(self.graph, changed_node) if changed_node in self.graph else set()
        stale_nodes = {changed_node} | descendants
        reused_nodes = set(self.stages.keys()) - stale_nodes

        # Mark nodes
        stale_list = sorted(list(stale_nodes))
        reused_list = sorted(list(reused_nodes))

        for node in stale_list:
            if node in case.plan.stages:
                rec = case.plan.stages[node]
                rec.status = StageStatus.STALE
                rec.replan_count += 1

        for node in reused_list:
            if node in case.plan.stages:
                rec = case.plan.stages[node]
                # If it was already completed, it remains reused
                if rec.status == StageStatus.COMPLETED:
                    rec.status = StageStatus.COMPLETED  # Keep cached

        replan_evt = ReplanEvent(
            trigger_evidence=changed_node,
            stale_stages=stale_list,
            reused_stages=reused_list,
            reason_text=reason,
        )
        case.plan.replan_history.append(replan_evt)
        case.bump_version()

        return stale_list, reused_list
