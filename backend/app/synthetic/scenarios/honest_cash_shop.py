"""Scenario 4: Honest Cash-Heavy Shop (Maa Laxmi Kirana Store).

Strictly adheres to NON-NEGOTIABLE RULE 7:
"Honest borrowers are protected. Cash-heavy cases without bank proof are Grade B, never called fraud."

Profile:
- Traditional retail provision/grocery store with high direct cash sales.
- Real turnover: ~₹42.0 Lakh/year (~₹3.5L/month).
- Bank credits: Only ₹14.0 Lakh/year (~₹1.16L/month) deposited into bank.
- Trust Gate: Grade B ("plausible but unconfirmed from bank deposits").
- Fraud Flags: STRICTLY ZERO. No accusatory language or fraud labels.
- Sized responsibly on confirmed bank cash (~₹15 Lakh).
- Comprehensive Evidence Ladder generated so the borrower can verify cash turnover.
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


def create_honest_cash_shop_scenario(seed: int = 42) -> CaseFile:
    """Generate deterministic CaseFile for an honest cash-heavy micro-retailer."""
    claimed_annual_sales = 4_200_000.0  # ₹42 Lakh reported sales
    bank_credits = 1_400_000.0          # ₹14 Lakh bank deposits
    confirmed_monthly_cash = 60_000.0   # ₹60k/month confirmed net bank cash
    existing_emi = 5_000.0              # ₹5k/month small shop loan
    requested_amount = 2_500_000.0      # ₹25 Lakh

    case = CaseFile(
        case_id="case_honest_cash_maa_laxmi_kirana",
        borrower_name="Maa Laxmi Kirana Store",
        entity_type="PROPRIETORSHIP",
        requested_amount_inr=requested_amount,
        version=1,
    )

    # Core Facts with Grade B for unbanked cash
    case.facts.extend([
        Fact(
            id="fact_claimed_retail_sales",
            name="Reported Retail Turnover (ITR & Sales Ledger)",
            value=claimed_annual_sales,
            source_doc="ITR-4_FY23-24.pdf",
            page=2,
            grade=FactGrade.GRADE_B,
            grade_reason=(
                "Plausible cash sales typical of neighborhood grocery retail, though majority does not pass "
                "through formal banking channels. Protected under Grade B policy."
            ),
            verified_by_stage="trust_gate",
            metadata={"business_nature": "Retail Grocery / Kirana", "composition_taxpayer": True},
        ),
        Fact(
            id="fact_bank_deposits_annual",
            name="Annual Banked Cash Deposits",
            value=bank_credits,
            source_doc="PNB_Current_Statement_FY24.pdf",
            page=12,
            grade=FactGrade.GRADE_A,
            grade_reason="Directly verified from 12 months Punjab National Bank statement",
            verified_by_stage="trust_gate",
            metadata={"bank_name": "Punjab National Bank", "cash_deposit_frequency": "Weekly"},
        ),
        Fact(
            id="fact_monthly_confirmed_cash",
            name="Confirmed Monthly Bank Cash Flow",
            value=confirmed_monthly_cash,
            source_doc="PNB_Current_Statement_FY24.pdf",
            page=12,
            grade=FactGrade.GRADE_A,
            grade_reason="Confirmed surplus cash available through regular weekly shop banking deposits",
            verified_by_stage="cashflow_analyzer",
        ),
        Fact(
            id="fact_bureau_score",
            name="Proprietor Credit Bureau Score",
            value=695,
            source_doc="CIBIL_Report_Jagdish_Prasad.pdf",
            page=1,
            grade=FactGrade.GRADE_A,
            grade_reason="Regular repayment history on two small personal/business loans with no defaults",
            verified_by_stage="bureau_kyc",
        ),
    ])

    # Humanized, respectful finding (NO FRAUD ALLEGATIONS)
    case.findings.append(
        Finding(
            id="finding_unconfirmed_cash_portion",
            stage="cashflow_analyzer",
            title="Cash Sales Awaiting Alternative Corroboration",
            description=(
                "We could not confirm the full ₹42.0 Lakh sales from bank records alone (bank credits are ₹14.0 Lakh), "
                "which is common and natural for daily cash grocery retail. This is assessed under Grade B. "
                "The borrower can easily show the rest through merchant QR history or supplier invoices."
            ),
            severity=FindingSeverity.INFO,
            confidence=0.88,
            evidence_refs=["fact_claimed_retail_sales", "fact_bank_deposits_annual"],
        )
    )

    # Evidence ladder to unlock higher loan amount
    case.evidence_ladder.extend([
        EvidenceLadderItem(
            id="ev_laxmi_upi_qr_logs",
            rank=1,
            cost_level=EvidenceCostLevel.CHEAP,
            description="Submit past 6 months UPI / QR soundbox transaction settlement reports",
            required_doc="Merchant UPI / QR Soundbox Statement",
            potential_unlocked_loan_inr=500_000.0,
            status=EvidenceStatus.PENDING,
        ),
        EvidenceLadderItem(
            id="ev_laxmi_distributor_receipts",
            rank=2,
            cost_level=EvidenceCostLevel.MEDIUM,
            description="Provide wholesale FMCG purchase invoices / delivery vouchers (e.g. HUL, ITC, Amul)",
            required_doc="Wholesale FMCG Purchase Receipts (6 Months)",
            potential_unlocked_loan_inr=400_000.0,
            status=EvidenceStatus.PENDING,
        ),
        EvidenceLadderItem(
            id="ev_laxmi_commercial_electricity",
            rank=3,
            cost_level=EvidenceCostLevel.CHEAP,
            description="Submit past 6 months commercial shop electricity receipts",
            required_doc="Shop Commercial Power Utility Receipts",
            potential_unlocked_loan_inr=200_000.0,
            status=EvidenceStatus.PENDING,
        ),
        EvidenceLadderItem(
            id="ev_laxmi_site_visit",
            rank=4,
            cost_level=EvidenceCostLevel.SITE_VISIT,
            description="Field officer site inspection to verify shop footfall, shelf inventory, and fast-moving staples",
            required_doc="Branch Field Verification & Footfall Assessment",
            potential_unlocked_loan_inr=300_000.0,
            status=EvidenceStatus.PENDING,
        ),
    ])

    # Raw documents
    case.raw_documents.extend([
        RawDocument(
            doc_id="doc_itr_laxmi",
            filename="ITR-4_FY23-24.pdf",
            doc_type="itr",
            raw_text="ITR-4 SUGAM Presumptive Taxation Section 44AD. Gross receipts from retail grocery business: INR 42,00,000. Presumptive net profit at 8%: INR 3,36,000.",
            extracted_data={"gross_receipts": claimed_annual_sales},
        ),
        RawDocument(
            doc_id="doc_pnb_laxmi",
            filename="PNB_Current_Statement_FY24.pdf",
            doc_type="bank_statement",
            raw_text="Punjab National Bank Current Account 089100. Total annual deposits: INR 14,00,000 across 52 weekly cash deposits.",
            extracted_data={"annual_deposits": bank_credits},
        ),
    ])

    return case
