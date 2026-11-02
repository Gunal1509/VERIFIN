"""Stage: Mock Ledger Posting Stage for Verifin.

Non-Negotiable Rule 2: No disbursal. Never create a route, function or ledger
state that releases money. Ledger entries are PENDING_APPROVAL until an authenticated approver acts.
"""

from __future__ import annotations

import hashlib
from typing import Any, Dict, List
from backend.app.core.casefile import CaseFile, StageStatus
from backend.app.stages.base import BaseStage, RunContext, StageResult


class LedgerStage(BaseStage):
    """Posts proposed loan sanction terms to the ledger with PENDING_APPROVAL status."""
    name: str = "ledger"
    deps: List[str] = ["cam"]
    reads: List[str] = ["decisions"]

    def inputs(self, case: CaseFile) -> Dict[str, Any]:
        return {
            "proposed_loan": case.decisions.proposed_loan_amount_inr if case.decisions else 0.0,
            "status": "PENDING_APPROVAL",
        }

    async def run(self, case: CaseFile, ctx: RunContext) -> StageResult:
        # NON-NEGOTIABLE RULE 2: Entries are strictly held as PENDING_APPROVAL
        ledger_entry = {
            "case_id": case.case_id,
            "status": "PENDING_APPROVAL",
            "proposed_loan_inr": case.decisions.proposed_loan_amount_inr if case.decisions else 0.0,
            "disbursal_route": "STRICTLY_LOCKED_NON_EXISTENT",
        }
        out_hash = hashlib.sha256(f"ledger:{ledger_entry['status']}:{ledger_entry['proposed_loan_inr']}".encode()).hexdigest()

        return StageResult(
            stage_name=self.name,
            status=StageStatus.COMPLETED,
            output_hash=out_hash,
            metadata=ledger_entry,
        )
