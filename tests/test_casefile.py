"""Unit tests for CaseFile blackboard schemas and data invariants."""

import pytest
from pydantic import ValidationError
from backend.app.core.casefile import (
    CaseFile,
    Fact,
    FactGrade,
    Finding,
    FindingSeverity,
    Objection,
    ObjectionStatus,
    EvidenceLadderItem,
    EvidenceCostLevel,
    EvidenceStatus,
    Decision,
    DecisionStatus,
    RawDocument,
)


def test_casefile_creation_and_version_bumping():
    case = CaseFile(
        case_id="case_test_001",
        borrower_name="Test Enterprise",
        entity_type="PROPRIETORSHIP",
        requested_amount_inr=1_000_000.0,
        version=1,
    )
    assert case.version == 1

    fact = Fact(
        id="fact_test_sales",
        name="Test Sales",
        value=5_000_000.0,
        source_doc="audit_test.pdf",
        page=1,
        grade=FactGrade.GRADE_A,
    )
    case.upsert_fact(fact)
    assert case.version == 2
    assert case.get_fact("fact_test_sales") is not None
    assert case.get_fact("fact_test_sales").value == 5_000_000.0

    # Updating existing fact replaces it and bumps version
    updated_fact = Fact(
        id="fact_test_sales",
        name="Test Sales",
        value=5_500_000.0,
        source_doc="audit_test_v2.pdf",
        page=1,
        grade=FactGrade.GRADE_A,
    )
    case.upsert_fact(updated_fact)
    assert case.version == 3
    assert len(case.facts) == 1
    assert case.get_fact("fact_test_sales").value == 5_500_000.0


def test_fact_requires_source_doc():
    """Every fact must carry provenance."""
    with pytest.raises(ValidationError):
        Fact(
            id="fact_invalid",
            name="Invalid Fact",
            value=100.0,
            source_doc="",  # Empty source_doc must be rejected
            page=1,
        )


def test_casefile_serialization_roundtrip():
    case = CaseFile(
        case_id="case_test_roundtrip",
        borrower_name="Roundtrip Borrower Ltd",
        entity_type="PVT_LTD",
        requested_amount_inr=2_500_000.0,
        facts=[
            Fact(
                id="f1",
                name="Fact 1",
                value=12345.67,
                source_doc="doc1.pdf",
                page=2,
                grade=FactGrade.GRADE_B,
            )
        ],
        findings=[
            Finding(
                id="finding1",
                stage="test_stage",
                title="Test Finding",
                description="Everything looks normal.",
                severity=FindingSeverity.INFO,
                confidence=0.95,
                evidence_refs=["f1"],
            )
        ],
        evidence_ladder=[
            EvidenceLadderItem(
                id="ev1",
                rank=1,
                cost_level=EvidenceCostLevel.CHEAP,
                description="Submit GST receipts",
                required_doc="GSTR-1",
                potential_unlocked_loan_inr=500_000.0,
                status=EvidenceStatus.PENDING,
            )
        ],
    )

    dumped = case.model_dump()
    restored = CaseFile.model_validate(dumped)

    assert restored.case_id == case.case_id
    assert len(restored.facts) == 1
    assert restored.facts[0].grade == FactGrade.GRADE_B
    assert len(restored.findings) == 1
    assert len(restored.evidence_ladder) == 1


def test_deterministic_state_hash():
    """State hash must be stable across identically-populated CaseFiles."""
    def make_case():
        return CaseFile(
            case_id="case_hash_test",
            borrower_name="Deterministic Corp",
            requested_amount_inr=5_000_000.0,
            version=1,
            facts=[
                Fact(id="f_alpha", name="Alpha", value=100, source_doc="d.pdf", page=1, grade=FactGrade.GRADE_A),
                Fact(id="f_beta", name="Beta", value=200, source_doc="d.pdf", page=2, grade=FactGrade.GRADE_B),
            ],
        )

    case_a = make_case()
    case_b = make_case()
    assert case_a.compute_state_hash() == case_b.compute_state_hash()

    # Changing a value must alter the hash
    case_b.facts[0].value = 999
    assert case_a.compute_state_hash() != case_b.compute_state_hash()
