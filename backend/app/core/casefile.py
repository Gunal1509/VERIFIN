"""Shared Case File (Blackboard) for MSME Underwriting Copilot.

This module provides the central, versioned CaseFile model along with all supporting
schemas: Fact, Finding, Objection, EvidenceLadderItem, Decision, DAGPlan, and RawDocument.
All schemas are strictly typed with Pydantic v2.
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, model_validator


class FactGrade(str, Enum):
    """Trust Gate validation grades."""
    GRADE_A = "A"  # Confirmed by a second independent source (e.g., GST matches bank credits)
    GRADE_B = "B"  # Plausible but unconfirmed (e.g., honest cash sales). Protected: never fraud.
    GRADE_C = "C"  # Contradicted by another record (e.g., circular trading, inflated GST)


class FindingSeverity(str, Enum):
    """Severity classification for stage findings."""
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    SEVERE = "SEVERE"


class ObjectionStatus(str, Enum):
    """Status of agent-to-agent objections."""
    OPEN = "OPEN"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"


class EvidenceCostLevel(str, Enum):
    """Borrower cost/effort level to produce evidence."""
    CHEAP = "CHEAP"           # Electricity bills, utility payments
    MEDIUM = "MEDIUM"         # GST return reconciliation, supplier invoices
    EXPENSIVE = "EXPENSIVE"   # Audited CA certificate, transporter e-way bills
    SITE_VISIT = "SITE_VISIT" # Physical site verification by field agent


class EvidenceStatus(str, Enum):
    """Status of evidence in the ladder."""
    PENDING = "PENDING"
    PROVIDED = "PROVIDED"
    VERIFIED = "VERIFIED"


class DecisionStatus(str, Enum):
    """Human-in-the-loop recommendation status. Never an automated rejection."""
    RECOMMEND_APPROVE = "RECOMMEND_APPROVE"
    RECOMMEND_FURTHER_REVIEW = "RECOMMEND_FURTHER_REVIEW"
    RECOMMEND_CONDITIONAL = "RECOMMEND_CONDITIONAL"


class StageStatus(str, Enum):
    """Lifecycle status of workflow stages."""
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    STALE = "STALE"
    SKIPPED = "SKIPPED"
    FAILED = "FAILED"


class Fact(BaseModel):
    """An individual extracted or derived datum.
    Every fact carries traceability to its origin and a Trust Gate grade.
    """
    id: str = Field(description="Unique fact identifier, e.g. 'fact_gst_turnover_fy24'")
    name: str = Field(description="Human-readable fact label, e.g. 'Reported Annual GST Turnover'")
    value: Any = Field(description="Deterministic extracted or reconciled value")
    source_doc: str = Field(description="Identifier or filename of source document")
    page: int = Field(default=1, ge=1, description="1-indexed page number in the source document")
    txn_id: Optional[str] = Field(default=None, description="Specific transaction ID if applicable")
    grade: Optional[FactGrade] = Field(default=None, description="Trust Gate grade (A, B, or C)")
    grade_reason: Optional[str] = Field(default=None, description="Plain-language explanation of grade")
    verified_by_stage: Optional[str] = Field(default=None, description="Stage that graded or confirmed fact")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional context or calculations")

    @model_validator(mode="after")
    def validate_provenance(self) -> Fact:
        if not self.source_doc:
            raise ValueError("Every fact must provide a valid source_doc.")
        return self


class Finding(BaseModel):
    """An observation or flag produced by an analytical stage or agent."""
    id: str = Field(description="Unique finding identifier, e.g. 'flag_turnover_gap_70pct'")
    stage: str = Field(description="Originating stage name, e.g. 'fraud_detector'")
    title: str = Field(description="Clear headline explaining the finding")
    description: str = Field(description="Colleague-style explanation of what was found and why")
    severity: FindingSeverity = Field(default=FindingSeverity.INFO)
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score from 0.0 to 1.0")
    evidence_refs: List[str] = Field(default_factory=list, description="List of fact IDs, txn IDs, or doc IDs")
    rule_fired: Optional[str] = Field(default=None, description="Identifier of the deterministic rule, if any")
    transaction_ids: List[str] = Field(default_factory=list, description="Direct list of relevant txn IDs")


class Objection(BaseModel):
    """An agent-to-agent challenge requiring resolution or review."""
    id: str = Field(description="Unique objection identifier")
    from_agent: str = Field(description="Agent raising objection")
    to_agent: str = Field(description="Agent addressed")
    reason: str = Field(description="Plain-language reason for the objection")
    status: ObjectionStatus = Field(default=ObjectionStatus.OPEN)
    evidence_refs: List[str] = Field(default_factory=list, description="Referenced fact or txn IDs")
    resolution_notes: Optional[str] = Field(default=None)


class EvidenceLadderItem(BaseModel):
    """A prioritized action/document that can resolve gaps and unlock additional loan amount."""
    id: str = Field(description="Unique identifier, e.g. 'ev_electricity_bills'")
    rank: int = Field(default=1, ge=1, description="Priority rank (1 is highest priority/cheapest)")
    cost_level: EvidenceCostLevel = Field(default=EvidenceCostLevel.CHEAP)
    description: str = Field(description="Human-friendly instruction on what evidence to provide")
    required_doc: str = Field(description="Name or category of required document")
    potential_unlocked_loan_inr: float = Field(ge=0.0, description="Estimated loan amount unlocked by this proof")
    status: EvidenceStatus = Field(default=EvidenceStatus.PENDING)
    submitted_doc_ref: Optional[str] = Field(default=None)


class Decision(BaseModel):
    """Proposed credit outcome. NOTE: System proposes, human decides. Disbursal is never automated."""
    proposed_status: DecisionStatus = Field(default=DecisionStatus.RECOMMEND_FURTHER_REVIEW)
    proposed_loan_amount_inr: float = Field(ge=0.0, description="Recommended loan amount in INR")
    interest_rate_pct: float = Field(ge=0.0, le=100.0, description="Recommended annual interest rate percentage")
    tenor_months: int = Field(ge=1, description="Tenor in months")
    dscr: float = Field(ge=0.0, description="Deterministic Debt Service Coverage Ratio")
    hard_policy_checks_passed: bool = Field(description="True if all deterministic policy limits passed")
    policy_violations: List[str] = Field(default_factory=list, description="List of policy limit breaches, if any")
    notes: str = Field(default="", description="Summary explanation for the loan officer")


class StageExecutionRecord(BaseModel):
    """Execution state and reproducibility metadata for a single stage."""
    stage_name: str
    status: StageStatus = Field(default=StageStatus.PENDING)
    input_hash: str = Field(default="")
    output_hash: str = Field(default="")
    execution_time_ms: float = Field(default=0.0)
    replan_count: int = Field(default=0)
    error_message: Optional[str] = Field(default=None)


class ReplanEvent(BaseModel):
    """Record of an incremental re-plan triggered by new evidence."""
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    trigger_evidence: str = Field(description="Description of newly provided evidence")
    stale_stages: List[str] = Field(description="Stages marked stale and rescheduled")
    reused_stages: List[str] = Field(description="Stages whose cached outputs are preserved")
    reason_text: str = Field(description="Human-readable reason for the re-plan")


class DAGPlan(BaseModel):
    """Current orchestrator execution plan."""
    stages: Dict[str, StageExecutionRecord] = Field(default_factory=dict)
    waves: List[List[str]] = Field(default_factory=list, description="Ordered waves of stages run in parallel")
    replan_history: List[ReplanEvent] = Field(default_factory=list)


class RawDocument(BaseModel):
    """Untrusted raw document payload loaded into the case file."""
    doc_id: str
    filename: str
    doc_type: str = Field(description="bank_statement | gst_return | itr | kyc | utility_bill")
    raw_text: str = Field(default="", description="Raw extracted text (untrusted)")
    extracted_data: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    has_potential_injection: bool = Field(default=False)


class CaseFile(BaseModel):
    """The central Blackboard model for an MSME loan application.
    Supports atomic version bumping, immutable snapshotting, and hash verification.
    """
    case_id: str = Field(description="Unique case identifier, e.g. 'case_sharma_traders'")
    borrower_name: str = Field(description="Legal entity or proprietor name")
    entity_type: str = Field(default="PROPRIETORSHIP", description="PROPRIETORSHIP | PARTNERSHIP | PVT_LTD")
    requested_amount_inr: float = Field(ge=0.0, description="Amount applied for in INR")
    version: int = Field(default=1, ge=1, description="Monotonically increasing version counter")
    facts: List[Fact] = Field(default_factory=list)
    findings: List[Finding] = Field(default_factory=list)
    objections: List[Objection] = Field(default_factory=list)
    evidence_ladder: List[EvidenceLadderItem] = Field(default_factory=list)
    decisions: Optional[Decision] = Field(default=None)
    plan: Optional[DAGPlan] = Field(default=None)
    raw_documents: List[RawDocument] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def bump_version(self) -> int:
        """Increment version and refresh timestamp upon atomic updates."""
        self.version += 1
        self.updated_at = datetime.now(timezone.utc)
        return self.version

    def get_fact(self, fact_id: str) -> Optional[Fact]:
        """Look up a fact by unique ID."""
        for fact in self.facts:
            if fact.id == fact_id:
                return fact
        return None

    def upsert_fact(self, fact: Fact) -> None:
        """Insert or replace a fact with traceable provenance."""
        for i, existing in enumerate(self.facts):
            if existing.id == fact.id:
                self.facts[i] = fact
                self.bump_version()
                return
        self.facts.append(fact)
        self.bump_version()

    def add_finding(self, finding: Finding) -> None:
        """Add an analytical finding."""
        self.findings.append(finding)
        self.bump_version()

    def compute_state_hash(self) -> str:
        """Deterministic hash of core financial facts and decisions for replay verification."""
        data_to_hash = {
            "case_id": self.case_id,
            "version": self.version,
            "requested_amount_inr": self.requested_amount_inr,
            "facts": sorted([{"id": f.id, "value": str(f.value), "grade": f.grade} for f in self.facts], key=lambda x: x["id"]),
            "findings": sorted([{"id": f.id, "severity": f.severity} for f in self.findings], key=lambda x: x["id"]),
            "decisions": self.decisions.model_dump() if self.decisions else None,
        }
        serialized = json.dumps(data_to_hash, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()
