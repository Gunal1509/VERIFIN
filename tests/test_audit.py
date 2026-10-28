"""Unit tests for the append-only AuditLogger."""

import pytest
from backend.app.core.audit import AuditLogger, AuditEntry, AuditEventType


def test_audit_log_append_and_immutability():
    logger = AuditLogger()
    assert len(logger.entries) == 0

    entry = logger.log(
        case_id="case_101",
        event_type=AuditEventType.TOOL_CALL,
        actor="cashflow_analyzer",
        action="calculate_monthly_cashflow",
        details={"months": 12, "net_cash": 150000},
        prompt_tokens=150,
        completion_tokens=50,
        latency_ms=120.5,
    )

    assert len(logger.entries) == 1
    assert entry.total_tokens == 200
    assert entry.actor == "cashflow_analyzer"

    # Entries are frozen/immutable
    with pytest.raises(Exception):
        entry.action = "tampered_action"  # type: ignore


def test_audit_filtering_and_token_totals():
    logger = AuditLogger()
    logger.log(
        case_id="case_A",
        event_type=AuditEventType.MODEL_CALL,
        actor="cam_drafter",
        action="draft_executive_summary",
        prompt_tokens=1000,
        completion_tokens=250,
    )
    logger.log(
        case_id="case_B",
        event_type=AuditEventType.MODEL_CALL,
        actor="cam_drafter",
        action="draft_executive_summary",
        prompt_tokens=800,
        completion_tokens=200,
    )
    logger.log(
        case_id="case_A",
        event_type=AuditEventType.INJECTION_DETECTED,
        actor="intake_scanner",
        action="quarantine_adversarial_prompt",
        prompt_tokens=0,
        completion_tokens=0,
    )

    case_a_entries = logger.filter_by_case("case_A")
    assert len(case_a_entries) == 2

    injections = logger.filter_by_event(AuditEventType.INJECTION_DETECTED)
    assert len(injections) == 1
    assert injections[0].case_id == "case_A"

    assert logger.total_tokens_used("case_A") == 1250
    assert logger.total_tokens_used("case_B") == 1000
    assert logger.total_tokens_used() == 2250
