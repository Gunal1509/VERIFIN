"""Unit tests verifying synthetic scenario generation and domain invariants."""

import pytest
from backend.app.core.casefile import FactGrade, FindingSeverity
from backend.app.synthetic.generator import (
    generate_scenario,
    generate_all_scenarios,
    list_scenarios,
    add_new_evidence_to_sharma,
)


def test_list_scenarios_contains_all_five():
    catalog = list_scenarios()
    names = [s["name"] for s in catalog]
    expected = [
        "clean_file",
        "sharma_traders",
        "linked_firm_ring",
        "honest_cash_shop",
        "prompt_injection_pdf",
    ]
    for exp in expected:
        assert exp in names


def test_generation_determinism():
    """Generating the same scenario with the same seed produces identical state hash."""
    case_1 = generate_scenario("sharma_traders", seed=42)
    case_2 = generate_scenario("sharma_traders", seed=42)
    assert case_1.compute_state_hash() == case_2.compute_state_hash()


def test_clean_file_scenario(clean_case):
    """Clean scenario must have Grade A facts and zero high/severe flags."""
    assert clean_case.case_id == "case_clean_apex_auto"
    assert clean_case.requested_amount_inr == 5_000_000.0

    gst_fact = clean_case.get_fact("fact_gst_turnover_annual")
    bank_fact = clean_case.get_fact("fact_bank_credits_annual")
    assert gst_fact is not None and gst_fact.grade == FactGrade.GRADE_A
    assert bank_fact is not None and bank_fact.grade == FactGrade.GRADE_A

    # No severe or high risk findings
    severe_flags = [f for f in clean_case.findings if f.severity in (FindingSeverity.HIGH, FindingSeverity.SEVERE)]
    assert len(severe_flags) == 0


def test_sharma_traders_scenario_invariants(sharma_case):
    """Sharma Traders benchmark:
    - GST declared ₹4.0 Cr, Bank ₹1.2 Cr
    - Turnover fact is Grade C
    - Turnover gap finding present with rule RULE_TURNOVER_GAP_EXCEEDED
    - Evidence ladder provides electricity bills unlocking ₹21 Lakh
    - Adding evidence increases verified cash and bumps version
    """
    assert sharma_case.case_id == "case_sharma_traders"
    gst_fact = sharma_case.get_fact("fact_gst_turnover_annual")
    bank_fact = sharma_case.get_fact("fact_bank_credits_annual")
    cash_fact = sharma_case.get_fact("fact_monthly_verified_cash")

    assert gst_fact.value == 40_000_000.0
    assert gst_fact.grade == FactGrade.GRADE_C
    assert bank_fact.value == 12_000_000.0
    assert cash_fact.value == 150_000.0  # ₹1.5L/mo initially

    # Gap finding
    gap_finding = next((f for f in sharma_case.findings if f.id == "flag_turnover_gap_sharma"), None)
    assert gap_finding is not None
    assert gap_finding.rule_fired == "RULE_TURNOVER_GAP_EXCEEDED"

    # Evidence ladder item check
    ev_item = next((e for e in sharma_case.evidence_ladder if e.id == "ev_sharma_electricity_bills"), None)
    assert ev_item is not None
    assert ev_item.potential_unlocked_loan_inr == 2_100_000.0

    # Test adding evidence
    initial_version = sharma_case.version
    updated_case = add_new_evidence_to_sharma(sharma_case)
    assert updated_case.version > initial_version
    updated_cash = updated_case.get_fact("fact_monthly_verified_cash")
    assert updated_cash.value == 210_000.0  # ₹2.1L/mo (+0.6L/mo)
    assert updated_cash.grade == FactGrade.GRADE_A


def test_linked_firm_ring_scenario(ring_case):
    """Linked firm ring must report circular transactions and shared identifiers."""
    assert ring_case.case_id == "case_linked_ring_sharma_verma_gupta"

    cycle_finding = next((f for f in ring_case.findings if f.id == "flag_circular_flow_detected"), None)
    assert cycle_finding is not None
    assert cycle_finding.severity == FindingSeverity.SEVERE
    assert len(cycle_finding.transaction_ids) >= 3

    shared_addr_finding = next((f for f in ring_case.findings if f.id == "flag_linked_entities_common_premise"), None)
    assert shared_addr_finding is not None
    assert shared_addr_finding.rule_fired == "RULE_LINKED_FIRM_SHARED_IDENTIFIER"


def test_honest_cash_shop_protected_rule(cash_shop_case):
    """NON-NEGOTIABLE RULE 7: Honest cash-heavy shop is NEVER called fraud.
    Must be Grade B, zero severe/high fraud flags.
    """
    assert cash_shop_case.case_id == "case_honest_cash_maa_laxmi_kirana"
    sales_fact = cash_shop_case.get_fact("fact_claimed_retail_sales")
    assert sales_fact is not None
    assert sales_fact.grade == FactGrade.GRADE_B

    # Must NOT have any fraud rules or high/severe findings
    for finding in cash_shop_case.findings:
        assert finding.severity not in (FindingSeverity.HIGH, FindingSeverity.SEVERE)
        assert "fraud" not in finding.title.lower()
        assert "fraud" not in finding.description.lower()

    # Evidence ladder cards must be present to help borrower
    assert len(cash_shop_case.evidence_ladder) >= 3


def test_prompt_injection_scenario(injection_case):
    """Adversarial prompt injection must be quarantined and flagged in raw documents."""
    assert injection_case.case_id == "case_injection_nexus_cloud"

    injection_fact = injection_case.get_fact("fact_adversarial_injection_detected")
    assert injection_fact is not None
    assert injection_fact.value is True

    injection_doc = next((d for d in injection_case.raw_documents if d.has_potential_injection), None)
    assert injection_doc is not None
    assert "SYSTEM OVERRIDE INSTRUCTION" in injection_doc.raw_text
