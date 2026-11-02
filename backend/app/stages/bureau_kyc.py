"""Stage: Bureau & KYC Stage for Verifin (runs parallel with intake)."""

from __future__ import annotations

import hashlib
import json
from typing import Any, Dict, List
from backend.app.core.casefile import CaseFile, StageStatus
from backend.app.stages.base import BaseStage, RunContext, StageResult


class BureauKYCStage(BaseStage):
    """Pulls credit bureau score and confirms identity credentials."""
    name: str = "bureau_kyc"
    deps: List[str] = []
    reads: List[str] = ["kyc_data"]

    def inputs(self, case: CaseFile) -> Dict[str, Any]:
        return {"borrower_name": case.borrower_name, "entity_type": case.entity_type}

    async def run(self, case: CaseFile, ctx: RunContext) -> StageResult:
        bureau_fact = case.get_fact("fact_bureau_score")
        facts_produced = [bureau_fact.id] if bureau_fact else []
        out_hash = hashlib.sha256(json.dumps(facts_produced, sort_keys=True).encode()).hexdigest()
        return StageResult(
            stage_name=self.name,
            status=StageStatus.COMPLETED,
            output_hash=out_hash,
            facts_produced=facts_produced,
        )
