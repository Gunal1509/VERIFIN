"""Stage Protocol and Execution Interfaces for Verifin.

Strictly adheres to Stage 1.1 Requirements:
Each stage declares: name, deps, reads (outside inputs such as evidence and policy_pack),
needed(case), inputs(case), and run(case, ctx).
input_hash(case) = SHA-256 over a canonical JSON of the stage's declared inputs,
including upstream stage outputs, so a change spreads downstream by itself.
"""

from __future__ import annotations

import hashlib
import json
from typing import Any, Dict, List, Protocol, runtime_checkable
from pydantic import BaseModel, Field
from backend.app.core.casefile import CaseFile, StageStatus


class RunContext(BaseModel):
    """Contextual metadata passed to a stage during execution."""
    trace_id: str = Field(default="")
    case_id: str = Field(default="")
    active_policy_pack: str = Field(default="bank_a")
    dry_run: bool = Field(default=False)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class StageResult(BaseModel):
    """Output produced by a stage execution."""
    stage_name: str
    status: StageStatus = Field(default=StageStatus.COMPLETED)
    output_hash: str = Field(default="")
    facts_produced: List[str] = Field(default_factory=list, description="IDs of facts produced or updated")
    findings_produced: List[str] = Field(default_factory=list, description="IDs of findings produced")
    execution_time_ms: float = Field(default=0.0)
    error_message: str | None = Field(default=None)
    metadata: Dict[str, Any] = Field(default_factory=dict)


@runtime_checkable
class Stage(Protocol):
    """Protocol implemented by every stage in backend/app/stages/."""
    name: str
    deps: List[str]    # Upstream stage names
    reads: List[str]   # Outside inputs (e.g., "raw_documents", "evidence", "policy_pack")

    def needed(self, case: CaseFile) -> bool:
        """Return True if this stage should run for the current case."""
        ...

    def inputs(self, case: CaseFile) -> Dict[str, Any]:
        """Declared inputs read from outside data or casefile."""
        ...

    def input_hash(self, case: CaseFile) -> str:
        """Compute deterministic SHA-256 over canonical JSON of declared inputs + upstream outputs."""
        ...

    async def run(self, case: CaseFile, ctx: RunContext) -> StageResult:
        """Execute stage logic and mutate/update the case file atomically."""
        ...


class BaseStage:
    """Base class providing default canonical input_hash implementation."""
    name: str = ""
    deps: List[str] = []
    reads: List[str] = []

    def needed(self, case: CaseFile) -> bool:
        return True

    def inputs(self, case: CaseFile) -> Dict[str, Any]:
        return {}

    def input_hash(self, case: CaseFile) -> str:
        """Compute SHA-256 over canonical JSON of declared inputs + upstream stage output hashes."""
        payload: Dict[str, Any] = {
            "stage": self.name,
            "reads": self.inputs(case),
            "deps": {},
        }
        if case.plan and case.plan.stages:
            for dep in sorted(self.deps):
                rec = case.plan.stages.get(dep)
                payload["deps"][dep] = rec.output_hash if rec else ""
        serialized = json.dumps(payload, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()
