"""Stage: Trust Gate Grading Stage for Verifin."""

from __future__ import annotations

import hashlib
from typing import Any, Dict, List
from backend.app.core.casefile import CaseFile, StageStatus, FactGrade
from backend.app.stages.base import BaseStage, RunContext, StageResult
from backend.app.calculators.trust_gate import evaluate_revenue_trust_gate


class TrustGateStage(BaseStage):
    """Triangulates extracted metrics against independent third-party documents."""
    name: str = "trust_gate"
    deps: List[str] = ["intake"]
    reads: List[str] = ["tax_turnover", "bank_credits"]

    def inputs(self, case: CaseFile) -> Dict[str, Any]:
        gst_fact = case.get_fact("fact_gst_turnover_annual")
        bank_fact = case.get_fact("fact_bank_credits_annual")
        return {
            "gst": gst_fact.value if gst_fact else 0.0,
            "bank": bank_fact.value if bank_fact else 0.0,
        }

    async def run(self, case: CaseFile, ctx: RunContext) -> StageResult:
        gst_fact = case.get_fact("fact_gst_turnover_annual")
        bank_fact = case.get_fact("fact_bank_credits_annual")

        is_retail = "kirana" in case.borrower_name.lower() or "retail" in case.borrower_name.lower()
        declared_gst = float(gst_fact.value) if gst_fact else 0.0
        bank_credits = float(bank_fact.value) if bank_fact else 0.0

        eval_res = evaluate_revenue_trust_gate(
            declared_gst_annual=declared_gst,
            bank_credits_annual=bank_credits,
            is_cash_retail=is_retail,
        )

        facts_produced = []
        if gst_fact:
            gst_fact.grade = eval_res.grade
            gst_fact.grade_reason = eval_res.reason
            facts_produced.append(gst_fact.id)

        out_hash = hashlib.sha256(f"{eval_res.grade}:{eval_res.gap_pct}".encode()).hexdigest()
        return StageResult(
            stage_name=self.name,
            status=StageStatus.COMPLETED,
            output_hash=out_hash,
            facts_produced=facts_produced,
            metadata={"gap_pct": eval_res.gap_pct, "grade": eval_res.grade},
        )
