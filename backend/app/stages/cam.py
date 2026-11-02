"""Stage: Credit Assessment Memorandum (CAM) & Proof Pack Stage for Verifin."""

from __future__ import annotations

import hashlib
from typing import Any, Dict, List
from backend.app.core.casefile import CaseFile, StageStatus
from backend.app.stages.base import BaseStage, RunContext, StageResult
from backend.app.security.citations import CamSentence, validate_cam_citations


class CAMStage(BaseStage):
    """Drafts Credit Assessment Memorandum and verifies 100% evidence citations."""
    name: str = "cam"
    deps: List[str] = ["structuring"]
    reads: List[str] = ["facts", "findings", "decisions"]

    def inputs(self, case: CaseFile) -> Dict[str, Any]:
        return {
            "loan": case.decisions.proposed_loan_amount_inr if case.decisions else 0.0,
            "dscr": case.decisions.dscr if case.decisions else 0.0,
        }

    async def run(self, case: CaseFile, ctx: RunContext) -> StageResult:
        sentences: List[CamSentence] = []

        gst_fact = case.get_fact("fact_gst_turnover_annual")
        bank_fact = case.get_fact("fact_bank_credits_annual")
        cash_fact = case.get_fact("fact_monthly_verified_cash")

        if gst_fact and bank_fact:
            sentences.append(
                CamSentence(
                    id="cam-1",
                    text=f"Reported GST supply of ₹{gst_fact.value:,.0f} vs verified bank inflows ₹{bank_fact.value:,.0f}.",
                    citations=[gst_fact.id, bank_fact.id],
                )
            )

        if cash_fact and case.decisions:
            sentences.append(
                CamSentence(
                    id="cam-2",
                    text=f"Verified cash of ₹{cash_fact.value:,.0f}/mo deterministically supports loan of ₹{case.decisions.proposed_loan_amount_inr:,.0f}.",
                    citations=[cash_fact.id],
                )
            )

        # Validate citations (Non-Negotiable Rule 4)
        report = validate_cam_citations(sentences, case.facts, case.evidence_ladder, case.findings)

        out_hash = hashlib.sha256(f"cam:{report.total_sentences}:{report.total_citations}".encode()).hexdigest()
        return StageResult(
            stage_name=self.name,
            status=StageStatus.COMPLETED,
            output_hash=out_hash,
            metadata={"citations_verified": report.valid, "sentences_count": report.total_sentences},
        )
