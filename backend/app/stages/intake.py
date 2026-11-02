"""Stage 1: Document Intake & Ingestion Stage for Verifin."""

from __future__ import annotations

import hashlib
import json
from typing import Any, Dict, List
from backend.app.core.casefile import CaseFile, StageStatus
from backend.app.stages.base import BaseStage, RunContext, StageResult
from backend.app.security.injection import scan_and_sanitize_document_text


class IntakeStage(BaseStage):
    """Parses raw borrower documents, scans for injections, and initializes facts."""
    name: str = "intake"
    deps: List[str] = []
    reads: List[str] = ["raw_documents"]

    def inputs(self, case: CaseFile) -> Dict[str, Any]:
        return {
            "num_docs": len(case.raw_documents),
            "doc_ids": [d.doc_id for d in case.raw_documents],
        }

    async def run(self, case: CaseFile, ctx: RunContext) -> StageResult:
        facts_produced: List[str] = []

        # Scan all raw documents for prompt injections
        for doc in case.raw_documents:
            scan = scan_and_sanitize_document_text(doc.raw_text, doc.metadata)
            doc.has_potential_injection = scan.detected
            doc.raw_text = scan.sanitized_text

        # Record facts extracted
        for f in case.facts:
            facts_produced.append(f.id)

        out_hash = hashlib.sha256(json.dumps(facts_produced, sort_keys=True).encode()).hexdigest()
        return StageResult(
            stage_name=self.name,
            status=StageStatus.COMPLETED,
            output_hash=out_hash,
            facts_produced=facts_produced,
        )
