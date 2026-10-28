"""Scenario 1: Clean File (Apex Auto Components Pvt Ltd).

Documents reconcile cleanly:
- GST GSTR-3B: ₹2.0 Crore
- Verified Bank Credits: ₹2.012 Crore
- Trust Gate Grade: A
- Zero fraud flags, healthy DSCR (~1.45), standard approval terms.
"""

from __future__ import annotations

import random
from typing import Dict, Any
from backend.app.core.casefile import (
    CaseFile,
    Fact,
    FactGrade,
    Finding,
    FindingSeverity,
    RawDocument,
)


def create_clean_file_scenario(seed: int = 42) -> CaseFile:
    """Generate deterministic CaseFile for a clean, fully-reconciled applicant."""
    rng = random.Random(seed)

    gst_turnover = 20_000_000.0  # ₹2.00 Cr
    bank_credits = 20_120_000.0  # ₹2.012 Cr
    monthly_net_cash = 250_000.0 # ₹2.50 Lakh/month
    existing_emi = 30_000.0      # ₹30k/month
    requested_amount = 5_000_000.0  # ₹50 Lakh

    case = CaseFile(
        case_id="case_clean_apex_auto",
        borrower_name="Apex Auto Components Pvt Ltd",
        entity_type="PVT_LTD",
        requested_amount_inr=requested_amount,
        version=1,
    )

    # Core Facts with provenance
    case.facts.extend([
        Fact(
            id="fact_gst_turnover_annual",
            name="Reported Annual GST Turnover (GSTR-3B)",
            value=gst_turnover,
            source_doc="GSTR-3B_FY2023-24.pdf",
            page=2,
            grade=FactGrade.GRADE_A,
            grade_reason="Reconciled with 12 months filed GSTR-1 and bank credits within 1% tolerance",
            verified_by_stage="trust_gate",
            metadata={"filing_period": "FY2023-24", "on_time_filing_pct": 100.0},
        ),
        Fact(
            id="fact_bank_credits_annual",
            name="Total Annual Inward Bank Credits",
            value=bank_credits,
            source_doc="HDFC_Bank_Statement_FY24.pdf",
            page=12,
            grade=FactGrade.GRADE_A,
            grade_reason="12 months continuous primary current account statements reconciled with GST",
            verified_by_stage="trust_gate",
            metadata={"account_no": "XXXX-XXXX-9012", "bank_name": "HDFC Bank"},
        ),
        Fact(
            id="fact_monthly_verified_cash",
            name="Verified Monthly Operating Cash Inflow",
            value=monthly_net_cash,
            source_doc="HDFC_Bank_Statement_FY24.pdf",
            page=12,
            grade=FactGrade.GRADE_A,
            grade_reason="Consistent monthly operational cash inflows without circular spikes",
            verified_by_stage="trust_gate",
        ),
        Fact(
            id="fact_bureau_score",
            name="Commercial Credit Bureau Score",
            value=760,
            source_doc="CIBIL_Commercial_Report.pdf",
            page=1,
            grade=FactGrade.GRADE_A,
            grade_reason="Direct API pull from credit bureau with 0 DPD in past 24 months",
            verified_by_stage="bureau_kyc",
        ),
        Fact(
            id="fact_existing_monthly_emi",
            name="Existing Monthly Debt Obligations",
            value=existing_emi,
            source_doc="CIBIL_Commercial_Report.pdf",
            page=3,
            grade=FactGrade.GRADE_A,
            grade_reason="Matches active bureau tradelines for machinery loan",
            verified_by_stage="bureau_kyc",
        ),
    ])

    # Raw document records
    case.raw_documents.extend([
        RawDocument(
            doc_id="doc_gstr_clean",
            filename="GSTR-3B_FY2023-24.pdf",
            doc_type="gst_return",
            raw_text="GSTR-3B SUMMARY FY23-24. Taxable turnover: INR 2,00,00,000. CGST: 18,00,000. SGST: 18,00,000. Total tax paid in cash: INR 4,20,000.",
            extracted_data={"taxable_turnover": gst_turnover, "filing_status": "REGULAR"},
        ),
        RawDocument(
            doc_id="doc_bank_clean",
            filename="HDFC_Bank_Statement_FY24.pdf",
            doc_type="bank_statement",
            raw_text="HDFC Current Account 50200012349012. Total credits: INR 2,01,20,000. Total debits: INR 1,94,00,000. Average monthly balance: INR 8,40,000.",
            extracted_data={"total_credits": bank_credits, "monthly_inflow_avg": bank_credits / 12},
        ),
    ])

    # Positive clean finding
    case.findings.append(
        Finding(
            id="finding_clean_reconciliation",
            stage="cashflow_analyzer",
            title="GST and Bank Inflows Fully Reconciled",
            description="GST sales (₹2.00 Cr) and verified bank credits (₹2.01 Cr) match with negligible variance (-0.6%), confirming genuine commercial operations.",
            severity=FindingSeverity.INFO,
            confidence=0.98,
            evidence_refs=["fact_gst_turnover_annual", "fact_bank_credits_annual"],
        )
    )

    return case
