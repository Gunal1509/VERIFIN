"""CAM Citation Validator for Verifin.

Non-Negotiable Rule 4: Every claim has evidence.
The CAM citation validator must fail on unsupported sentences.
"""

from __future__ import annotations

from typing import Any, Dict, List, Set
from pydantic import BaseModel, Field
from backend.app.core.casefile import Fact, EvidenceLadderItem, Finding


class CitationValidationError(Exception):
    """Raised when a Credit Assessment Memorandum sentence lacks valid evidence."""
    pass


class CamSentence(BaseModel):
    """A single sentence in the credit memo with mandatory evidence citations."""
    id: str
    text: str
    citations: List[str] = Field(description="List of fact IDs, txn IDs, evidence item IDs, or doc names")


class CitationValidationReport(BaseModel):
    """Validation report verifying memo provenance."""
    valid: bool
    total_sentences: int
    total_citations: int
    unsupported_sentences: List[str] = Field(default_factory=list)
    invalid_citations: List[str] = Field(default_factory=list)


def validate_cam_citations(
    sentences: List[CamSentence],
    facts: List[Fact],
    evidence_items: Optional[List[EvidenceLadderItem]] = None,
    findings: Optional[List[Finding]] = None,
) -> CitationValidationReport:
    """Validate that every CAM sentence carries valid, verifiable citations.
    
    Fails (raises CitationValidationError) if:
    1. A sentence has zero citations.
    2. A cited ID does not exist in the CaseFile's facts, evidence ladder, or findings.
    """
    valid_ids: Set[str] = set()
    for fact in facts:
        valid_ids.add(fact.id)
        if fact.txn_id:
            valid_ids.add(fact.txn_id)
        if fact.source_doc:
            valid_ids.add(fact.source_doc)

    if evidence_items:
        for ev in evidence_items:
            valid_ids.add(ev.id)

    if findings:
        for finding in findings:
            valid_ids.add(finding.id)
            for tid in finding.transaction_ids:
                valid_ids.add(tid)

    unsupported: List[str] = []
    invalid_citations: List[str] = []
    total_citations_count = 0

    for s in sentences:
        if not s.citations:
            unsupported.append(f"Sentence [{s.id}] has ZERO citations: '{s.text}'")
            continue

        for cit in s.citations:
            total_citations_count += 1
            if cit not in valid_ids:
                invalid_citations.append(f"Sentence [{s.id}] references invalid/unknown evidence ID: '{cit}'")

    if unsupported or invalid_citations:
        err_msg = "CAM Citation Validation FAILED:\n" + "\n".join(unsupported + invalid_citations)
        raise CitationValidationError(err_msg)

    return CitationValidationReport(
        valid=True,
        total_sentences=len(sentences),
        total_citations=total_citations_count,
        unsupported_sentences=[],
        invalid_citations=[],
    )
