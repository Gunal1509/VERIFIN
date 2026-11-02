"""Immutable Ledger State Machine for Verifin.

Non-Negotiable Rule 2: No disbursal. Never create a route, function or ledger
state that releases money. Ledger entries are PENDING_APPROVAL until an authenticated
approver acts.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class LedgerStatus(str, Enum):
    """Permitted ledger statuses. Notice: NO DISBURSED or RELEASED status exists."""
    PENDING_APPROVAL = "PENDING_APPROVAL"
    SANCTIONED = "SANCTIONED"
    SENT_BACK = "SENT_BACK"
    ESCALATED = "ESCALATED"


class LedgerEntry(BaseModel):
    """An individual credit ledger record."""
    entry_id: str
    case_id: str
    status: LedgerStatus = Field(default=LedgerStatus.PENDING_APPROVAL)
    sanctioned_amount_inr: float = Field(ge=0.0)
    interest_rate_pct: float = Field(ge=0.0)
    tenor_months: int = Field(ge=1)
    approved_by: Optional[str] = Field(default=None)
    approval_timestamp: Optional[datetime] = Field(default=None)
    decision_notes: str = Field(default="")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LedgerStateMachine:
    """Manages immutable ledger state transitions with mandatory human authentication."""

    def __init__(self) -> None:
        self._entries: Dict[str, LedgerEntry] = {}

    def create_pending_entry(
        self,
        entry_id: str,
        case_id: str,
        proposed_amount_inr: float,
        interest_rate_pct: float = 12.0,
        tenor_months: int = 60,
    ) -> LedgerEntry:
        """Create entry with mandatory initial status PENDING_APPROVAL."""
        entry = LedgerEntry(
            entry_id=entry_id,
            case_id=case_id,
            status=LedgerStatus.PENDING_APPROVAL,
            sanctioned_amount_inr=proposed_amount_inr,
            interest_rate_pct=interest_rate_pct,
            tenor_months=tenor_months,
        )
        self._entries[entry_id] = entry
        return entry

    def transition(
        self,
        entry_id: str,
        new_status: LedgerStatus,
        officer_name: str,
        officer_role: str,
        notes: str = "",
    ) -> LedgerEntry:
        """Transition an entry status. Strictly requires authorized CREDIT_OFFICER role."""
        if officer_role not in ("CREDIT_OFFICER", "RISK_HEAD", "SENIOR_UNDERWRITER"):
            raise PermissionError(f"Role '{officer_role}' is not authorized to decide on loan ledger.")

        entry = self._entries.get(entry_id)
        if not entry:
            raise KeyError(f"Ledger entry '{entry_id}' not found.")

        if new_status not in (LedgerStatus.SANCTIONED, LedgerStatus.SENT_BACK, LedgerStatus.ESCALATED):
            raise ValueError(f"Invalid target status '{new_status}'. Allowed: SANCTIONED, SENT_BACK, ESCALATED.")

        updated = entry.model_copy(
            update={
                "status": new_status,
                "approved_by": f"{officer_name} ({officer_role})",
                "approval_timestamp": datetime.now(timezone.utc),
                "decision_notes": notes,
            }
        )
        self._entries[entry_id] = updated
        return updated

    def get_entry(self, entry_id: str) -> Optional[LedgerEntry]:
        return self._entries.get(entry_id)
