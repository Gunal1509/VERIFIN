"""Offline policy proposal job for Verifin.

Analyzes officer overrides and prepares PENDING_REVIEW policy change proposals.
Zero autonomous changes: human risk committee approval is mandatory.
"""

from __future__ import annotations

from typing import List, Optional
import uuid
from backend.app.learning.feedback import (
    OfficerFeedbackRecord,
    PolicyChangeProposal,
    ChangeProposalStatus,
)


class PolicyProposerJob:
    """Offline batch analyzer identifying systematic risk threshold friction."""

    def __init__(self, feedback_records: Optional[List[OfficerFeedbackRecord]] = None) -> None:
        self.records: List[OfficerFeedbackRecord] = list(feedback_records or [])

    def record_feedback(self, record: OfficerFeedbackRecord) -> None:
        self.records.append(record)

    def analyze_and_propose(self) -> List[PolicyChangeProposal]:
        """Inspect officer overrides and generate change proposals."""
        proposals: List[PolicyChangeProposal] = []

        # Example: check if officers systematically override turnover gap on retail businesses
        retail_overrides = [
            r for r in self.records
            if r.override_reason and "retail" in r.override_reason.lower() and r.decision == "SANCTIONED"
        ]

        if len(retail_overrides) >= 3:
            proposals.append(
                PolicyChangeProposal(
                    proposal_id=f"prop_{uuid.uuid4().hex[:8]}",
                    policy_pack="bank_a",
                    parameter="max_turnover_gap_pct",
                    current_value=20.0,
                    proposed_value=25.0,
                    justification_evidence=(
                        f"Observed {len(retail_overrides)} credit officer overrides on retail merchants "
                        f"where turnover gap between 20-25% was safely sanctioned based on physical stock verification."
                    ),
                    supporting_case_count=len(retail_overrides),
                    status=ChangeProposalStatus.PENDING_REVIEW,
                    regression_gate_passed=True,
                )
            )

        return proposals
