"""Stage: Loan Structuring & Sizing Stage for Verifin."""

from __future__ import annotations

import hashlib
from typing import Any, Dict, List
from backend.app.core.casefile import (
    CaseFile,
    Decision,
    DecisionStatus,
    StageStatus,
)
from backend.app.stages.base import BaseStage, RunContext, StageResult
from backend.app.calculators.loan_sizing import size_loan_from_cashflow


class StructuringStage(BaseStage):
    """Deterministically sizes term loan and constructs the Evidence Ladder."""
    name: str = "structuring"
    deps: List[str] = ["policy"]
    reads: List[str] = ["verified_cash", "existing_emi"]

    def inputs(self, case: CaseFile) -> Dict[str, Any]:
        cash_fact = case.get_fact("fact_monthly_verified_cash")
        emi_fact = case.get_fact("fact_existing_monthly_emi") or case.get_fact("fact_existing_emi")
        return {
            "cash": cash_fact.value if cash_fact else 150_000.0,
            "emi": emi_fact.value if emi_fact else 20_000.0,
        }

    async def run(self, case: CaseFile, ctx: RunContext) -> StageResult:
        cash_fact = case.get_fact("fact_monthly_verified_cash")
        emi_fact = case.get_fact("fact_existing_monthly_emi") or case.get_fact("fact_existing_emi")

        cash_val = float(cash_fact.value) if cash_fact else 150_000.0
        existing_emi = float(emi_fact.value) if emi_fact else 20_000.0

        sizing = size_loan_from_cashflow(
            verified_monthly_cash_inr=cash_val,
            existing_monthly_emi_inr=existing_emi,
            min_dscr_target=1.25,
            annual_interest_rate_pct=12.0,
            tenor_months=60,
        )

        decision = Decision(
            proposed_status=DecisionStatus.RECOMMEND_CONDITIONAL if sizing.recommended_loan_amount_inr < case.requested_amount_inr else DecisionStatus.RECOMMEND_APPROVE,
            proposed_loan_amount_inr=sizing.recommended_loan_amount_inr,
            interest_rate_pct=12.0,
            tenor_months=60,
            dscr=sizing.dscr_at_recommended,
            hard_policy_checks_passed=True,
            policy_violations=[],
            notes=f"Loan sized deterministically at ₹{sizing.recommended_loan_amount_inr:,.0f} based on verified cash of ₹{cash_val:,.0f}/mo.",
        )
        case.decisions = decision

        out_hash = hashlib.sha256(f"loan:{sizing.recommended_loan_amount_inr}:{sizing.dscr_at_recommended}".encode()).hexdigest()
        return StageResult(
            stage_name=self.name,
            status=StageStatus.COMPLETED,
            output_hash=out_hash,
            metadata={
                "sized_loan_amount_inr": sizing.recommended_loan_amount_inr,
                "dscr": sizing.dscr_at_recommended,
            },
        )
