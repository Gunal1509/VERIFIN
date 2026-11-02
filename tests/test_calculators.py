"""Unit tests for deterministic financial calculators and Trust Gate."""

import pytest
from backend.app.calculators.dscr import compute_dscr
from backend.app.calculators.loan_sizing import (
    calculate_annuity_present_value,
    size_loan_from_cashflow,
)
from backend.app.calculators.trust_gate import evaluate_revenue_trust_gate
from backend.app.core.casefile import FactGrade


def test_dscr_calculation():
    # Normal case: ₹1.5L verified cash, ₹1.2L total EMI obligations -> DSCR 1.25x
    assert compute_dscr(150_000.0, 120_000.0) == 1.25
    # Stressed case: ₹1.5L verified cash, ₹1.67L debt service -> DSCR 0.90x
    assert compute_dscr(150_000.0, 166_667.0) == 0.90
    # Zero cashflow
    assert compute_dscr(0.0, 50_000.0) == 0.0


def test_sharma_traders_pure_loan_sizing():
    """Sharma Traders case study must deterministically produce:
    - Base: ~₹45 Lakh
    - After new evidence (electricity bills): ~₹66.5 Lakh
    Pure Python math, zero hardcoded numbers.
    """
    # 1. Base Sharma Case: ₹1.5L/mo verified cash, ₹20k/mo existing EMI, 1.25 min DSCR, 12% p.a., 60 mo
    base_sizing = size_loan_from_cashflow(
        verified_monthly_cash_inr=150_000.0,
        existing_monthly_emi_inr=20_000.0,
        min_dscr_target=1.25,
        annual_interest_rate_pct=12.0,
        tenor_months=60,
    )
    # Max total EMI = 150000 / 1.25 = 120000
    # Available new EMI = 120000 - 20000 = 100000
    assert base_sizing.max_total_emi_capacity_inr == 120_000.0
    assert base_sizing.available_new_emi_capacity_inr == 100_000.0
    # PV of 100,000 for 60 months at 1% per month = 4,495,503.84
    assert 4_490_000.0 <= base_sizing.present_value_raw_inr <= 4_500_000.0
    assert base_sizing.recommended_loan_amount_inr == 4_500_000.0  # Rounds to 45 Lakh
    assert base_sizing.dscr_at_recommended == 1.25

    # 2. Sharma Case with Additional Utility Evidence:
    # BSES power load verifies an additional ₹60,000/mo cashflow (Total: ₹2.1 Lakh/mo)
    evidence_sizing = size_loan_from_cashflow(
        verified_monthly_cash_inr=210_000.0,
        existing_monthly_emi_inr=20_000.0,
        min_dscr_target=1.25,
        annual_interest_rate_pct=12.0,
        tenor_months=60,
    )
    # Max total EMI = 210000 / 1.25 = 168000
    # Available new EMI = 168000 - 20000 = 148000
    assert evidence_sizing.max_total_emi_capacity_inr == 168_000.0
    assert evidence_sizing.available_new_emi_capacity_inr == 148_000.0
    # PV of 148,000 for 60 months at 1% per month = 6,653,345.68
    assert 6_650_000.0 <= evidence_sizing.present_value_raw_inr <= 6_660_000.0
    # Recommended loan is ~₹66.5 Lakh (or 67 Lakh depending on rounding)
    assert evidence_sizing.recommended_loan_amount_inr in (6_600_000.0, 6_700_000.0)
    assert evidence_sizing.dscr_at_recommended == 1.25


def test_trust_gate_grading_invariants():
    # 1. Clean Case (Apex Auto): Declared ₹2.0 Cr vs Bank ₹2.012 Cr (-0.6% gap) -> Grade A
    clean_eval = evaluate_revenue_trust_gate(20_000_000.0, 20_120_000.0, is_cash_retail=False)
    assert clean_eval.grade == FactGrade.GRADE_A
    assert clean_eval.gap_pct == -0.6

    # 2. Honest Cash Retail (Maa Laxmi Kirana): Declared ₹80L vs Bank ₹30L (62.5% unbanked)
    # Non-Negotiable Rule 7: Must be Grade B, NEVER Grade C or fraud
    cash_eval = evaluate_revenue_trust_gate(8_000_000.0, 3_000_000.0, is_cash_retail=True)
    assert cash_eval.grade == FactGrade.GRADE_B
    assert "fraud" not in cash_eval.reason.lower()

    # 3. Inflated Turnover Wholesaler (Sharma Traders): Declared ₹4.0 Cr vs Bank ₹1.2 Cr (70% gap)
    # Non-retail business without banking trail -> Grade C
    sharma_eval = evaluate_revenue_trust_gate(40_000_000.0, 12_000_000.0, is_cash_retail=False)
    assert sharma_eval.grade == FactGrade.GRADE_C
    assert sharma_eval.gap_pct == 70.0
