"""Stage: Credit Risk & DSCR Analysis Stage for Verifin."""

from __future__ import annotations

import hashlib
from typing import Any, Dict, List
from backend.app.core.casefile import CaseFile, StageStatus, Finding, FindingSeverity
from backend.app.stages.base import BaseStage, RunContext, StageResult
from backend.app.calculators.dscr import compute_dscr


class RiskStage(BaseStage):
    """Calculates coverage ratios and assesses credit risk profile."""
    name: str = "risk"
    deps: List[str] = ["cashflow", "fraud", "bureau_kyc"]
    reads: List[str] = ["monthly_cash", "existing_emi", "requested_amount"]

    def inputs(self, case: CaseFile) -> Dict[str, Any]:
        cash_fact = case.get_fact("fact_monthly_verified_cash")
        emi_fact = case.get_fact("fact_existing_monthly_emi") or case.get_fact("fact_existing_emi")
        return {
            "cash": cash_fact.value if cash_fact else 0.0,
            "existing_emi": emi_fact.value if emi_fact else 0.0,
            "requested_loan": case.requested_amount_inr,
        }

    async def run(self, case: CaseFile, ctx: RunContext) -> StageResult:
        cash_fact = case.get_fact("fact_monthly_verified_cash")
        emi_fact = case.get_fact("fact_existing_monthly_emi") or case.get_fact("fact_existing_emi")

        cash_val = float(cash_fact.value) if cash_fact else 150_000.0
        existing_emi = float(emi_fact.value) if emi_fact else 20_000.0

        # Approximate requested loan monthly instalment:
        # e.g. for ₹75 Lakh at 12% for 5 years = ~1.67 Lakh/mo
        r = 0.01
        n = 60
        pmt_requested = case.requested_amount_inr * (r * (1 + r)**n) / ((1 + r)**n - 1) if case.requested_amount_inr > 0 else 0.0
        total_debt_service = existing_emi + pmt_requested

        dscr = compute_dscr(cash_val, total_debt_service)

        findings_produced = []
        if dscr < 1.25 and case.requested_amount_inr >= 5_000_000.0:
            finding = Finding(
                id="flag_dscr_deficit_evaluated",
                stage=self.name,
                title=f"DSCR Stressed on Requested Amount ({dscr:.2f}x)",
                description=f"At the requested ₹{case.requested_amount_inr:,.0f} loan size, DSCR is {dscr:.2f}x (policy floor: 1.25x).",
                severity=FindingSeverity.MEDIUM,
                confidence=0.95,
                evidence_refs=["fact_monthly_verified_cash"],
                rule_fired="RULE_DSCR_MINIMUM_BREACH",
            )
            case.add_finding(finding)
            findings_produced.append(finding.id)

        out_hash = hashlib.sha256(f"dscr:{dscr}".encode()).hexdigest()
        return StageResult(
            stage_name=self.name,
            status=StageStatus.COMPLETED,
            output_hash=out_hash,
            findings_produced=findings_produced,
            metadata={"dscr": dscr, "total_debt_service": round(total_debt_service, 2)},
        )
