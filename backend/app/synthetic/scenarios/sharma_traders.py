"""Scenario 2: Inflated Sales (Sharma Traders).

Key Benchmark Case from SPEC.md:
- GST declared turnover: ₹4.0 Crore
- Verified bank inflow: ₹1.2 Crore
- Turnover gap: 70% ((4.0 - 1.2)/4.0)
- Trust Gate Grade: C (contradicted by bank statements)
- Verified monthly cash: ₹1.5 Lakh/month
- Existing obligations: ₹0.2 Lakh/month
- Min DSCR required: 1.25
- Eligible instalment = 1.5 / 1.25 - 0.2 = 1.0 Lakh/month
- PV at 12% for 5 years = ₹44,95,503 (~₹45 Lakh)
- Initial DSCR = ~0.9 (below policy floor of 1.25)
- Additional evidence (electricity bills) unlocks +₹0.6 Lakh/month verified cash:
  New instalment = (1.5 + 0.6) / 1.25 - 0.2 = 1.48 Lakh/month
  PV at 12% for 5 years = ₹66,53,345 (~₹66 Lakh)
"""

from __future__ import annotations

from typing import Dict, Any
from backend.app.core.casefile import (
    CaseFile,
    Fact,
    FactGrade,
    Finding,
    FindingSeverity,
    EvidenceLadderItem,
    EvidenceCostLevel,
    EvidenceStatus,
    RawDocument,
)


def create_sharma_traders_scenario(seed: int = 42) -> CaseFile:
    """Generate deterministic CaseFile for Sharma Traders (inflated turnover case)."""
    gst_turnover = 40_000_000.0   # ₹4.00 Cr reported
    bank_credits = 12_000_000.0   # ₹1.20 Cr verified
    monthly_net_cash = 150_000.0  # ₹1.50 Lakh/month
    existing_emi = 20_000.0       # ₹0.20 Lakh/month
    requested_amount = 7_500_000.0 # ₹75 Lakh

    case = CaseFile(
        case_id="case_sharma_traders",
        borrower_name="Sharma Traders",
        entity_type="PROPRIETORSHIP",
        requested_amount_inr=requested_amount,
        version=1,
    )

    # Core Facts
    case.facts.extend([
        Fact(
            id="fact_gst_turnover_annual",
            name="Reported Annual GST Turnover (GSTR-3B)",
            value=gst_turnover,
            source_doc="Sharma_GSTR3B_FY24.pdf",
            page=1,
            grade=FactGrade.GRADE_C,
            grade_reason="Reported sales of ₹4.0 Cr exceed verified bank deposits of ₹1.2 Cr by 70%",
            verified_by_stage="trust_gate",
            metadata={"declared_turnover": gst_turnover, "reported_tax_slab": "18%"},
        ),
        Fact(
            id="fact_bank_credits_annual",
            name="Total Annual Inward Bank Credits",
            value=bank_credits,
            source_doc="Sharma_SBI_Current_FY24.pdf",
            page=24,
            grade=FactGrade.GRADE_A,
            grade_reason="Verified directly from 12-month SBI current account e-statement",
            verified_by_stage="trust_gate",
            metadata={"account_no": "SBI-CA-449102", "branch": "Chandni Chowk, Delhi"},
        ),
        Fact(
            id="fact_monthly_verified_cash",
            name="Verified Monthly Operating Cash Inflow",
            value=monthly_net_cash,
            source_doc="Sharma_SBI_Current_FY24.pdf",
            page=24,
            grade=FactGrade.GRADE_A,
            grade_reason="Net operational deposits averaging ₹1.5 Lakh/month after stripping inter-account transfers",
            verified_by_stage="cashflow_analyzer",
        ),
        Fact(
            id="fact_existing_monthly_emi",
            name="Existing Monthly Debt Obligations",
            value=existing_emi,
            source_doc="CIBIL_Report_Ramesh_Sharma.pdf",
            page=2,
            grade=FactGrade.GRADE_A,
            grade_reason="Active commercial vehicle loan instalment of ₹20,000/month",
            verified_by_stage="bureau_kyc",
        ),
        Fact(
            id="fact_bureau_score",
            name="Proprietor Credit Bureau Score",
            value=710,
            source_doc="CIBIL_Report_Ramesh_Sharma.pdf",
            page=1,
            grade=FactGrade.GRADE_A,
            grade_reason="CIBIL consumer/commercial score 710 with regular historical repayment",
            verified_by_stage="bureau_kyc",
        ),
    ])

    # Discrepancy Findings
    turnover_gap_pct = ((gst_turnover - bank_credits) / gst_turnover) * 100.0
    case.findings.extend([
        Finding(
            id="flag_turnover_gap_sharma",
            stage="fraud_detector",
            title="Severe Turnover Gap (70.0%)",
            description=(
                f"Borrower reported GST sales of ₹4.00 Cr, but verified inward bank credits are only ₹1.20 Cr. "
                f"The unverified turnover gap is {turnover_gap_pct:.1f}%, exceeding the lender threshold of 20%."
            ),
            severity=FindingSeverity.HIGH,
            confidence=0.95,
            evidence_refs=["fact_gst_turnover_annual", "fact_bank_credits_annual"],
            rule_fired="RULE_TURNOVER_GAP_EXCEEDED",
        ),
        Finding(
            id="flag_dscr_deficit_sharma",
            stage="risk_analyzer",
            title="DSCR Stressed on Requested Loan (0.90)",
            description=(
                "Based on verified monthly cash flow (₹1.5 Lakh/month), the DSCR for the requested ₹75 Lakh loan "
                "is approximately 0.90, below the policy minimum of 1.25."
            ),
            severity=FindingSeverity.MEDIUM,
            confidence=0.92,
            evidence_refs=["fact_monthly_verified_cash", "fact_existing_monthly_emi"],
            rule_fired="RULE_DSCR_MINIMUM_BREACH",
        ),
    ])

    # Evidence Ladder to raise the loan
    case.evidence_ladder.extend([
        EvidenceLadderItem(
            id="ev_sharma_electricity_bills",
            rank=1,
            cost_level=EvidenceCostLevel.CHEAP,
            description="Submit 12 months commercial electricity utility receipts showing active factory/warehouse load",
            required_doc="Commercial Electricity Utility Bills (12 Months)",
            potential_unlocked_loan_inr=2_100_000.0, # Unlocks additional ₹21L (Total ~₹66L)
            status=EvidenceStatus.PENDING,
        ),
        EvidenceLadderItem(
            id="ev_sharma_eway_bills",
            rank=2,
            cost_level=EvidenceCostLevel.MEDIUM,
            description="Provide transporter e-way bills and delivery challans corroborating the ₹2.8 Cr unbanked sales",
            required_doc="NIC E-Way Bills & Consignment Notes",
            potential_unlocked_loan_inr=900_000.0,
            status=EvidenceStatus.PENDING,
        ),
        EvidenceLadderItem(
            id="ev_sharma_site_visit",
            rank=3,
            cost_level=EvidenceCostLevel.SITE_VISIT,
            description="Field officer physical stock and business premises audit to verify inventory turnover",
            required_doc="Field Verification & Stock Inspection Report",
            potential_unlocked_loan_inr=500_000.0,
            status=EvidenceStatus.PENDING,
        ),
    ])

    # Raw documents
    case.raw_documents.extend([
        RawDocument(
            doc_id="doc_sharma_gstr",
            filename="Sharma_GSTR3B_FY24.pdf",
            doc_type="gst_return",
            raw_text="GSTR-3B RET-1. Taxable supply of goods: INR 4,00,00,000. Total outward taxable value: 40000000. Integrated Tax: 0. Central Tax: 3600000. State Tax: 3600000.",
            extracted_data={"turnover": gst_turnover},
        ),
        RawDocument(
            doc_id="doc_sharma_bank",
            filename="Sharma_SBI_Current_FY24.pdf",
            doc_type="bank_statement",
            raw_text="State Bank of India. Account 449102 Sharma Traders. Total inward credits for 365 days: INR 1,20,00,000 across 340 transactions.",
            extracted_data={"inward_credits": bank_credits},
        ),
    ])

    return case


def add_sharma_electricity_bills_evidence(case: CaseFile) -> CaseFile:
    """Simulate borrower uploading electricity bills as new evidence.
    Increases verified monthly cash by ₹0.6 Lakh/month (from 1.5L to 2.1L),
    which unlocks loan sizing from ₹45 Lakh to ₹66 Lakh.
    """
    new_doc = RawDocument(
        doc_id="doc_sharma_electricity_fy24",
        filename="BSES_Commercial_Electricity_FY24.pdf",
        doc_type="utility_bill",
        raw_text="BSES Rajdhani Power Ltd. CA No: 102938475. Metered Commercial Load 45kW. Average monthly bill INR 62,500 paid consistently via auto-debit.",
        extracted_data={"avg_monthly_bill_inr": 62_500.0, "estimated_incremental_cash_flow": 60_000.0},
    )
    case.raw_documents.append(new_doc)

    # Update verified monthly cash fact
    cash_fact = case.get_fact("fact_monthly_verified_cash")
    if cash_fact:
        cash_fact.value = 210_000.0  # ₹2.10 Lakh/month (+0.6L)
        cash_fact.grade = FactGrade.GRADE_A
        cash_fact.grade_reason = (
            "Verified operational cash upgraded to ₹2.1 Lakh/month after corroboration with 12 months commercial electricity bills"
        )
        cash_fact.source_doc = "BSES_Commercial_Electricity_FY24.pdf"
        case.upsert_fact(cash_fact)

    # Update evidence ladder status
    for item in case.evidence_ladder:
        if item.id == "ev_sharma_electricity_bills":
            item.status = EvidenceStatus.VERIFIED
            item.submitted_doc_ref = "BSES_Commercial_Electricity_FY24.pdf"

    case.bump_version()
    return case
