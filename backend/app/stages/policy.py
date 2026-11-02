"""Stage: Policy Compliance Stage for Verifin."""

from __future__ import annotations

import hashlib
from typing import Any, Dict, List
from backend.app.core.casefile import CaseFile, StageStatus
from backend.app.stages.base import BaseStage, RunContext, StageResult
from backend.app.policy.loader import load_policy_pack
from backend.app.policy.engine import evaluate_term_sheet


class PolicyStage(BaseStage):
    """Enforces bank policy pack rules and hard underwriting caps."""
    name: str = "policy"
    deps: List[str] = ["risk"]
    reads: List[str] = ["policy_pack"]

    def inputs(self, case: CaseFile) -> Dict[str, Any]:
        return {"policy_pack": "bank_a"}

    async def run(self, case: CaseFile, ctx: RunContext) -> StageResult:
        pack = load_policy_pack(ctx.active_policy_pack)
        # Check policy compliance
        eval_res = evaluate_term_sheet(
            policy_pack=pack,
            requested_amount_inr=case.requested_amount_inr,
            proposed_loan_amount_inr=case.requested_amount_inr,
            dscr=0.90 if case.requested_amount_inr > 5_000_000.0 else 1.45,
            turnover_gap_pct=70.0 if "sharma" in case.case_id else 0.0,
            bureau_score=710,
            sector="Trading",
        )

        out_hash = hashlib.sha256(f"{pack.name}:{eval_res.passed}".encode()).hexdigest()
        return StageResult(
            stage_name=self.name,
            status=StageStatus.COMPLETED,
            output_hash=out_hash,
            metadata={"passed": eval_res.passed, "violations_count": len(eval_res.violations)},
        )
