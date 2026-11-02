"""Deterministic Policy Engine for Verifin.

Non-Negotiable Rule 1: Code computes, models explain.
Never ask a model to decide a policy breach. Hard limits must be enforced in code.
"""

from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field
from backend.app.policy.loader import PolicyPack


class PolicyViolation(BaseModel):
    """An identified policy parameter breach."""
    rule_id: str
    parameter: str
    limit_value: float | str
    actual_value: float | str
    description: str
    is_hard_limit: bool = True


class PolicyEvaluationResult(BaseModel):
    """Result of evaluating loan terms against an active policy pack."""
    policy_name: str
    passed: bool
    violations: List[PolicyViolation] = Field(default_factory=list)
    capped_loan_amount_inr: float
    notes: str = Field(default="")


def evaluate_term_sheet(
    policy_pack: PolicyPack,
    requested_amount_inr: float,
    proposed_loan_amount_inr: float,
    dscr: float,
    turnover_gap_pct: float,
    bureau_score: int,
    sector: str = "",
    unbanked_cash_share_pct: float = 0.0,
    outside_world_share_pct: float = 100.0,
) -> PolicyEvaluationResult:
    """Enforce deterministic policy pack rules against a proposed credit structure.
    
    Returns a PolicyEvaluationResult indicating pass/fail and listing all breaches.
    Caps the proposed loan amount to max_loan_amount_inr if exceeded.
    """
    violations: List[PolicyViolation] = []
    limits = policy_pack.limits

    # 1. Sector exclusion check
    for excluded in policy_pack.sector_exclusions:
        if excluded.lower() in sector.lower():
            violations.append(
                PolicyViolation(
                    rule_id="RULE_SECTOR_EXCLUDED",
                    parameter="sector",
                    limit_value=excluded,
                    actual_value=sector,
                    description=f"Industry sector '{sector}' is strictly excluded under {policy_pack.name}.",
                    is_hard_limit=True,
                )
            )

    # 2. DSCR Floor check
    if dscr < limits.min_dscr:
        violations.append(
            PolicyViolation(
                rule_id="RULE_DSCR_MINIMUM_BREACH",
                parameter="min_dscr",
                limit_value=limits.min_dscr,
                actual_value=dscr,
                description=f"Calculated DSCR {dscr:.2f}x is below the mandatory policy floor of {limits.min_dscr:.2f}x.",
                is_hard_limit=True,
            )
        )

    # 3. Bureau Score check
    if bureau_score < limits.min_bureau_score:
        violations.append(
            PolicyViolation(
                rule_id="RULE_BUREAU_SCORE_INSUFFICIENT",
                parameter="min_bureau_score",
                limit_value=limits.min_bureau_score,
                actual_value=bureau_score,
                description=f"Credit score {bureau_score} does not meet the minimum threshold of {limits.min_bureau_score}.",
                is_hard_limit=True,
            )
        )

    # 4. Turnover Gap check
    if turnover_gap_pct > limits.max_turnover_gap_pct:
        violations.append(
            PolicyViolation(
                rule_id="RULE_TURNOVER_GAP_EXCEEDED",
                parameter="max_turnover_gap_pct",
                limit_value=limits.max_turnover_gap_pct,
                actual_value=turnover_gap_pct,
                description=f"Turnover gap of {turnover_gap_pct:.1f}% exceeds lender tolerance of {limits.max_turnover_gap_pct:.1f}%.",
                is_hard_limit=False,
            )
        )

    # 5. Outside-world turnover test
    if outside_world_share_pct < limits.min_outside_world_share_pct:
        violations.append(
            PolicyViolation(
                rule_id="RULE_OUTSIDE_WORLD_TEST_FAILED",
                parameter="min_outside_world_share_pct",
                limit_value=limits.min_outside_world_share_pct,
                actual_value=outside_world_share_pct,
                description=f"Only {outside_world_share_pct:.1f}% of turnover leaves the counterparty ring (minimum required: {limits.min_outside_world_share_pct:.1f}%).",
                is_hard_limit=True,
            )
        )

    # 6. Ticket size cap
    capped_amount = proposed_loan_amount_inr
    if proposed_loan_amount_inr > limits.max_loan_amount_inr:
        capped_amount = limits.max_loan_amount_inr
        violations.append(
            PolicyViolation(
                rule_id="RULE_MAX_TICKET_EXCEEDED",
                parameter="max_loan_amount_inr",
                limit_value=limits.max_loan_amount_inr,
                actual_value=proposed_loan_amount_inr,
                description=f"Proposed loan ₹{proposed_loan_amount_inr:,.0f} exceeds maximum product ceiling of ₹{limits.max_loan_amount_inr:,.0f}. Amount capped.",
                is_hard_limit=True,
            )
        )

    # 7. Minimum ticket size
    if proposed_loan_amount_inr < limits.min_loan_amount_inr:
        violations.append(
            PolicyViolation(
                rule_id="RULE_MIN_TICKET_BREACH",
                parameter="min_loan_amount_inr",
                limit_value=limits.min_loan_amount_inr,
                actual_value=proposed_loan_amount_inr,
                description=f"Proposed loan ₹{proposed_loan_amount_inr:,.0f} is below minimum ticket floor of ₹{limits.min_loan_amount_inr:,.0f}.",
                is_hard_limit=True,
            )
        )

    hard_breaches = [v for v in violations if v.is_hard_limit]
    passed = len(hard_breaches) == 0

    notes = "All policy limits verified and satisfied." if passed else f"{len(violations)} policy limit breaches flagged."

    return PolicyEvaluationResult(
        policy_name=policy_pack.name,
        passed=passed,
        violations=violations,
        capped_loan_amount_inr=capped_amount,
        notes=notes,
    )
