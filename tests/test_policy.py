"""Unit tests verifying deterministic Policy Engine limit enforcement."""

import pytest
from backend.app.policy.loader import load_policy_pack, list_available_policy_packs
from backend.app.policy.engine import evaluate_term_sheet


def test_policy_pack_loading():
    packs = list_available_policy_packs()
    assert "bank_a" in packs
    assert "bank_b" in packs

    pack_a = load_policy_pack("bank_a")
    assert pack_a.limits.min_dscr == 1.25
    assert pack_a.limits.max_loan_amount_inr == 10_000_000.0

    pack_b = load_policy_pack("bank_b")
    assert pack_b.limits.min_dscr == 1.40
    assert pack_b.limits.max_loan_amount_inr == 5_000_000.0  # Conservative ₹50L cap


def test_clean_term_sheet_passes_policy():
    pack_a = load_policy_pack("bank_a")
    res = evaluate_term_sheet(
        policy_pack=pack_a,
        requested_amount_inr=5_000_000.0,
        proposed_loan_amount_inr=5_000_000.0,
        dscr=1.45,
        turnover_gap_pct=-0.6,
        bureau_score=760,
        sector="Precision Auto Engineering",
    )
    assert res.passed is True
    assert len(res.violations) == 0
    assert res.capped_loan_amount_inr == 5_000_000.0


def test_breaching_term_sheet_strictly_rejected():
    """Policy engine must reject a term sheet that breaks limits regardless of model proposal."""
    pack_b = load_policy_pack("bank_b")

    # 1. Breaches:
    # - DSCR 1.10x < 1.40x floor
    # - Bureau score 680 < 720 min
    # - Proposed loan ₹75L > ₹50L cap
    res = evaluate_term_sheet(
        policy_pack=pack_b,
        requested_amount_inr=7_500_000.0,
        proposed_loan_amount_inr=7_500_000.0,
        dscr=1.10,
        turnover_gap_pct=15.0,
        bureau_score=680,
        sector="Building Materials",
    )
    assert res.passed is False
    assert len(res.violations) >= 3
    rule_ids = [v.rule_id for v in res.violations]
    assert "RULE_DSCR_MINIMUM_BREACH" in rule_ids
    assert "RULE_BUREAU_SCORE_INSUFFICIENT" in rule_ids
    assert "RULE_MAX_TICKET_EXCEEDED" in rule_ids
    # Amount is capped to Bank B ceiling of 50 Lakh
    assert res.capped_loan_amount_inr == 5_000_000.0


def test_excluded_sector_rejection():
    pack_a = load_policy_pack("bank_a")
    res = evaluate_term_sheet(
        policy_pack=pack_a,
        requested_amount_inr=2_000_000.0,
        proposed_loan_amount_inr=2_000_000.0,
        dscr=2.0,
        turnover_gap_pct=5.0,
        bureau_score=800,
        sector="Cryptocurrency Trading Desk",
    )
    assert res.passed is False
    rule_ids = [v.rule_id for v in res.violations]
    assert "RULE_SECTOR_EXCLUDED" in rule_ids
