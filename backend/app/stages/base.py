"""Stage Protocol and Execution Interfaces for MSME Underwriting Copilot.

Matches Section 2.4 of docs/SPEC.md:
Every stage is an independent, single-purpose module that declares its prerequisite
inputs, computes an input hash for incremental re-planning, and produces a StageResult.
"""

from __future__ import annotations

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
    requires: List[str]  # Upstream stage names or case-file keys

    def input_hash(self, case: CaseFile) -> str:
        """Compute deterministic hash of this stage's inputs to check staleness."""
        ...

    async def run(self, case: CaseFile, ctx: RunContext) -> StageResult:
        """Execute stage logic and mutate/update the case file atomically."""
        ...
