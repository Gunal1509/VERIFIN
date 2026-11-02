"""Automated Safety Verification Test: Zero-Disbursal Guarantee.

NON-NEGOTIABLE RULE 2:
"No disbursal. Never create a route, function or ledger state that releases money.
Ledger entries are PENDING_APPROVAL until an authenticated approver acts."

This test rigorously scans the active FastAPI route table and ledger state machine,
and asserts that NO money-release endpoint or status exists anywhere.
"""

import pytest
from fastapi.routing import APIRoute
from backend.app.api.main import app
from backend.app.ledger.state_machine import LedgerStateMachine, LedgerStatus, LedgerEntry


DISBURSAL_FORBIDDEN_KEYWORDS = [
    "disburse",
    "payout",
    "pay_out",
    "release_funds",
    "transfer_funds",
    "send_money",
    "wire_transfer",
    "execute_disbursement",
]


def test_no_disbursal_route_exists_in_fastapi():
    """Scan all registered routes in the FastAPI application to verify zero disbursal endpoints."""
    all_routes = [route for route in app.routes if isinstance(route, APIRoute)]
    assert len(all_routes) > 0, "FastAPI route table is empty!"

    for route in all_routes:
        path_lower = route.path.lower()
        name_lower = route.name.lower()
        summary_lower = (route.summary or "").lower()

        for forbidden in DISBURSAL_FORBIDDEN_KEYWORDS:
            assert forbidden not in path_lower, (
                f"SAFETY VIOLATION: Forbidden keyword '{forbidden}' found in route path: {route.path}"
            )
            assert forbidden not in name_lower, (
                f"SAFETY VIOLATION: Forbidden keyword '{forbidden}' found in route handler name: {route.name}"
            )
            assert forbidden not in summary_lower, (
                f"SAFETY VIOLATION: Forbidden keyword '{forbidden}' found in route summary: {route.summary}"
            )


def test_ledger_state_machine_has_no_disbursed_status():
    """Verify that the ledger state machine has no money-release states."""
    allowed_statuses = {"PENDING_APPROVAL", "SANCTIONED", "SENT_BACK", "ESCALATED"}
    actual_statuses = {s.value for s in LedgerStatus}

    # Verify no DISBURSED or RELEASED status exists
    assert actual_statuses == allowed_statuses
    assert "DISBURSED" not in actual_statuses
    assert "RELEASED" not in actual_statuses
    assert "PAID_OUT" not in actual_statuses


def test_ledger_entries_created_as_pending_approval():
    """Entries must strictly be created with PENDING_APPROVAL status."""
    sm = LedgerStateMachine()
    entry = sm.create_pending_entry(
        entry_id="test_001",
        case_id="case_sharma",
        proposed_amount_inr=4_500_000.0,
    )
    assert entry.status == LedgerStatus.PENDING_APPROVAL
    assert entry.approved_by is None
    assert entry.approval_timestamp is None


def test_unauthorized_role_cannot_transition_ledger():
    """Only authorized CREDIT_OFFICER or RISK_HEAD can sign off."""
    sm = LedgerStateMachine()
    sm.create_pending_entry("test_002", "case_sharma", 4_500_000.0)

    # Unauthorized role must be rejected
    with pytest.raises(PermissionError):
        sm.transition(
            entry_id="test_002",
            new_status=LedgerStatus.SANCTIONED,
            officer_name="intern_user",
            officer_role="INTERN",
        )
