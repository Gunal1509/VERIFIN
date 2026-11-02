"""Global in-memory singletons and case repository for Verifin demo."""

from typing import Dict
from backend.app.core.casefile import CaseFile
from backend.app.core.audit import AuditLogger
from backend.app.ledger.state_machine import LedgerStateMachine
from backend.app.learning.proposer import PolicyProposerJob
from backend.app.synthetic.generator import generate_scenario, list_scenarios

# Singletons
_CASE_STORE: Dict[str, CaseFile] = {}
_AUDIT_LOGGER = AuditLogger()
_LEDGER = LedgerStateMachine()
_FEEDBACK_JOB = PolicyProposerJob()


def get_case_store() -> Dict[str, CaseFile]:
    """Initialize case store with the 5 seeded benchmark cases if empty."""
    if not _CASE_STORE:
        for s in list_scenarios():
            case = generate_scenario(s["name"], seed=42)
            _CASE_STORE[case.case_id] = case
            _LEDGER.create_pending_entry(
                entry_id=f"ledger_{case.case_id}",
                case_id=case.case_id,
                proposed_amount_inr=case.decisions.proposed_loan_amount_inr if case.decisions else 0.0,
            )
    return _CASE_STORE
