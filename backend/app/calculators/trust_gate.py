"""Deterministic Trust Gate (A/B/C) Triangulation Engine.

Non-Negotiable Rule 1: Code computes, models explain.
Non-Negotiable Rule 7: Honest borrowers are protected. Cash-heavy cases without bank
proof are Grade B, never called fraud.
"""

from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field
from backend.app.core.casefile import FactGrade


class TrustGateEvaluation(BaseModel):
    """Deterministic grading assessment produced by the Trust Gate."""
    metric_name: str
    declared_value: float
    corroborated_value: float
    gap_pct: float
    grade: FactGrade
    reason: str
    source_docs: List[str] = Field(default_factory=list)


def evaluate_revenue_trust_gate(
    declared_gst_annual: float,
    bank_credits_annual: float,
    is_cash_retail: bool = False,
    max_acceptable_variance_pct: float = 20.0,
    source_docs: Optional[List[str]] = None,
) -> TrustGateEvaluation:
    """Evaluate declared sales vs bank inflows through the Trust Gate.
    
    Grading logic:
    - Grade A: Declared turnover matches bank inflows within max_acceptable_variance_pct (typically 20%).
    - Grade B: Significant turnover gap (> 20%), but borrower operates a cash-heavy retail trade
               (Maa Laxmi Kirana). Protected: strictly never labelled fraud.
    - Grade C: Significant turnover gap (> 20%) in non-cash commercial wholesaler without banking trail.
    """
    if declared_gst_annual <= 0.0:
        return TrustGateEvaluation(
            metric_name="Annual Turnover",
            declared_value=declared_gst_annual,
            corroborated_value=bank_credits_annual,
            gap_pct=0.0,
            grade=FactGrade.GRADE_C,
            reason="Declared GST turnover is zero or unrecorded.",
            source_docs=source_docs or [],
        )

    # Calculate gap percentage relative to declared turnover
    gap_inr = declared_gst_annual - bank_credits_annual
    gap_pct = round((gap_inr / declared_gst_annual) * 100.0, 2)

    if abs(gap_pct) <= max_acceptable_variance_pct:
        grade = FactGrade.GRADE_A
        reason = (
            f"Confirmed by independent records: GST turnover aligns with verified bank credits "
            f"within tolerance (variance: {gap_pct:+.1f}%)."
        )
    elif is_cash_retail:
        # NON-NEGOTIABLE RULE 7: Honest cash retail protected as Grade B
        grade = FactGrade.GRADE_B
        reason = (
            f"Plausible unbanked cash turnover ({gap_pct:.1f}% unbanked). Common for neighborhood "
            f"cash-retail business; corroborating evidence recommended via Evidence Ladder."
        )
    else:
        # Contradicted by banking records without retail cash justification
        grade = FactGrade.GRADE_C
        reason = (
            f"Contradicted by banking trail: Declared GST turnover exceeds inward bank deposits "
            f"by {gap_pct:.1f}% without secondary corroboration."
        )

    return TrustGateEvaluation(
        metric_name="Annual Turnover",
        declared_value=declared_gst_annual,
        corroborated_value=bank_credits_annual,
        gap_pct=gap_pct,
        grade=grade,
        reason=reason,
        source_docs=source_docs or [],
    )
