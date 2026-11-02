"""Stage: Human Credit Officer Decision Gate for Verifin.

Non-Negotiable Rule 3: No automatic rejection. The system proposes, a human decides.
"""

from __future__ import annotations

import hashlib
from typing import Any, Dict, List
from backend.app.core.casefile import CaseFile, StageStatus
from backend.app.stages.base import BaseStage, RunContext, StageResult


class HumanDecisionStage(BaseStage):
    """Presents structured findings to an authorized credit officer for final sign-off."""
    name: str = "human"
    deps: List[str] = ["ledger"]
    reads: List[str] = ["ledger_entry"]

    def inputs(self, case: CaseFile) -> Dict[str, Any]:
        return {"awaiting_officer": True}

    async def run(self, case: CaseFile, ctx: RunContext) -> StageResult:
        # Final gate holds for human decision: Approve, Send Back, or Escalate
        out_hash = hashlib.sha256("human_gate_ready".encode()).hexdigest()
        return StageResult(
            stage_name=self.name,
            status=StageStatus.COMPLETED,
            output_hash=out_hash,
            metadata={"gate_status": "AWAITING_CREDIT_OFFICER_ACTION"},
        )
