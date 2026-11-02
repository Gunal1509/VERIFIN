"""Integration tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient
from backend.app.api.main import app

client = TestClient(app)


def test_health_check_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["disbursal_route"] == "STRICTLY_LOCKED_NON_EXISTENT"


def test_list_cases_endpoint():
    res = client.get("/api/cases")
    assert res.status_code == 200
    cases = res.json()
    assert len(cases) >= 5
    ids = [c["id"] for c in cases]
    assert "case_sharma_traders" in ids
    assert "case_clean_apex_auto" in ids


def test_get_case_detail_endpoint():
    res = client.get("/api/cases/case_sharma_traders")
    assert res.status_code == 200
    case = res.json()
    assert case["case_id"] == "case_sharma_traders"
    assert case["borrower_name"] == "Sharma Traders"
    assert len(case["facts"]) > 0


def test_upload_evidence_triggers_replan():
    """Posting new utility evidence must trigger incremental re-plan and resizing."""
    res = client.post(
        "/api/cases/case_sharma_traders/evidence",
        json={
            "doc_id": "ev_bses_electricity_bills",
            "doc_type": "utility_bill",
            "raw_text": "BSES Rajdhani commercial meter power consumption 4500 kWh/mo.",
            "description": "BSES Commercial Electricity Bills",
            "unlocked_loan_amount_inr": 2_100_000.0,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "replan_completed"
    # Derived from graph: 7 recomputed, 4 reused
    assert data["recomputed_count"] == 7
    assert data["cached_count"] == 4
    assert data["compute_saved_pct"] > 35.0
    # Loan amount should be resized upwards (to ~66-67 Lakh)
    assert data["new_proposed_loan_inr"] in (6_600_000.0, 6_700_000.0)


def test_replay_case_endpoint():
    res = client.post("/api/cases/case_sharma_traders/replay")
    assert res.status_code == 200
    data = res.json()
    assert data["replay_matched"] is True
    assert data["deterministic"] is True


def test_submit_officer_decision():
    """Submit approval decision to ledger with authorized role."""
    res = client.post(
        "/api/cases/case_sharma_traders/decision",
        json={
            "decision": "SANCTIONED",
            "officer_name": "Priya Sharma",
            "officer_role": "CREDIT_OFFICER",
            "decision_notes": "Sanctioned at ₹66 Lakh following electricity bill verification.",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "decision_recorded"
    assert data["ledger_status"] == "SANCTIONED"
    assert "Priya Sharma" in data["approved_by"]


def test_reject_illegal_status_in_decision():
    """Attempting an unauthorized status (like DISBURSED) must be rejected."""
    res = client.post(
        "/api/cases/case_sharma_traders/decision",
        json={
            "decision": "DISBURSED",
            "officer_name": "Bad Actor",
            "officer_role": "CREDIT_OFFICER",
        },
    )
    assert res.status_code == 422 or res.status_code == 400
