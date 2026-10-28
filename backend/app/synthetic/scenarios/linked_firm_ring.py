"""Scenario 3: Linked-Firm Circular Trading Ring (Sharma, Verma, Gupta).

Key Requirements from SPEC.md:
- Circular flow: directed cycle in the payer-to-payee graph (NetworkX) where value
  returns to origin within a tight window with similar amounts.
- Linked firms: shared address, director (DIN), or phone using hashed identifiers.
- Outside-world test: failing because volume is predominantly reciprocal.
- Every flag stores transaction IDs and the exact rule that fired.
"""

from __future__ import annotations

import hashlib
from typing import Dict, List, Any
from backend.app.core.casefile import (
    CaseFile,
    Fact,
    FactGrade,
    Finding,
    FindingSeverity,
    RawDocument,
)


def hash_identifier(identifier: str) -> str:
    """Hash personal or corporate identifiers for privacy-preserving entity resolution."""
    return hashlib.sha256(identifier.strip().upper().encode("utf-8")).hexdigest()[:16]


def create_linked_firm_ring_scenario(seed: int = 42) -> CaseFile:
    """Generate deterministic CaseFile for circular trading ring between Sharma, Verma, and Gupta."""
    case = CaseFile(
        case_id="case_linked_ring_sharma_verma_gupta",
        borrower_name="Sharma Global Exports Pvt Ltd",
        entity_type="PVT_LTD",
        requested_amount_inr=15_000_000.0, # ₹1.5 Cr
        version=1,
    )

    # Identifiers demonstrating linked entities
    shared_address = "Plot 42, Okhla Industrial Area Phase-III, New Delhi 110020"
    shared_address_hash = hash_identifier(shared_address)
    shared_phone = "+91-9811001122"
    shared_phone_hash = hash_identifier(shared_phone)

    # Circular transactions forming cycles: Sharma -> Verma -> Gupta -> Sharma
    transactions = [
        {
            "txn_id": "TXN_RING_001",
            "date": "2024-03-05",
            "from_entity": "Sharma Global Exports Pvt Ltd",
            "to_entity": "Verma Logistics Solutions",
            "amount_inr": 2_500_000.0,
            "description": "INV-SH-442 logistics advance",
        },
        {
            "txn_id": "TXN_RING_002",
            "date": "2024-03-08",
            "from_entity": "Verma Logistics Solutions",
            "to_entity": "Gupta Trading Corp",
            "amount_inr": 2_480_000.0,
            "description": "INV-VR-109 trade settlement",
        },
        {
            "txn_id": "TXN_RING_003",
            "date": "2024-03-11",
            "from_entity": "Gupta Trading Corp",
            "to_entity": "Sharma Global Exports Pvt Ltd",
            "amount_inr": 2_470_000.0,
            "description": "INV-GP-883 consultancy fees",
        },
        # Second cycle loop
        {
            "txn_id": "TXN_RING_004",
            "date": "2024-04-12",
            "from_entity": "Sharma Global Exports Pvt Ltd",
            "to_entity": "Verma Logistics Solutions",
            "amount_inr": 1_800_000.0,
            "description": "INV-SH-498 supply advance",
        },
        {
            "txn_id": "TXN_RING_005",
            "date": "2024-04-15",
            "from_entity": "Verma Logistics Solutions",
            "to_entity": "Gupta Trading Corp",
            "amount_inr": 1_790_000.0,
            "description": "INV-VR-155 freight settlement",
        },
        {
            "txn_id": "TXN_RING_006",
            "date": "2024-04-18",
            "from_entity": "Gupta Trading Corp",
            "to_entity": "Sharma Global Exports Pvt Ltd",
            "amount_inr": 1_780_000.0,
            "description": "INV-GP-912 materials payment",
        },
    ]

    cycle_1_txns = ["TXN_RING_001", "TXN_RING_002", "TXN_RING_003"]
    cycle_2_txns = ["TXN_RING_004", "TXN_RING_005", "TXN_RING_006"]
    all_cycle_txns = cycle_1_txns + cycle_2_txns

    # Facts with traceable evidence
    case.facts.extend([
        Fact(
            id="fact_turnover_claimed",
            name="Reported Annual Turnover",
            value=35_000_000.0,
            source_doc="Sharma_Global_Financials_FY24.pdf",
            page=4,
            grade=FactGrade.GRADE_C,
            grade_reason="Reported turnover heavily inflated by circular inter-firm transactions",
            verified_by_stage="trust_gate",
        ),
        Fact(
            id="fact_shared_registered_address",
            name="Shared Entity Registered Address Hash",
            value=shared_address_hash,
            source_doc="MCA_Company_Master_Data.pdf",
            page=1,
            grade=FactGrade.GRADE_A,
            grade_reason="Identical physical premise registered under both Sharma Global and Verma Logistics in MCA records",
            verified_by_stage="trust_gate",
            metadata={"address_hash": shared_address_hash, "entities": ["Sharma Global", "Verma Logistics"]},
        ),
        Fact(
            id="fact_shared_contact_phone",
            name="Shared Director Phone Hash",
            value=shared_phone_hash,
            source_doc="MCA_Company_Master_Data.pdf",
            page=2,
            grade=FactGrade.GRADE_A,
            grade_reason="Identical mobile phone number listed on GST registrations for Verma Logistics and Gupta Trading",
            verified_by_stage="trust_gate",
            metadata={"phone_hash": shared_phone_hash, "entities": ["Verma Logistics", "Gupta Trading"]},
        ),
        Fact(
            id="fact_circular_transaction_count",
            name="Identified Circular Cycle Transactions",
            value=len(all_cycle_txns),
            source_doc="Axis_Bank_Current_Statement_FY24.pdf",
            page=15,
            grade=FactGrade.GRADE_A,
            grade_reason="Deterministic graph cycles found in Axis Bank statement payer/payee graph",
            verified_by_stage="fraud_detector",
            metadata={"cycle_transactions": all_cycle_txns},
        ),
    ])

    # Flags storing specific transaction IDs and firing rules
    case.findings.extend([
        Finding(
            id="flag_circular_flow_detected",
            stage="fraud_detector",
            title="Directed Circular Invoicing Loop Detected (Sharma -> Verma -> Gupta -> Sharma)",
            description=(
                "Directed graph cycle detected: Funds sent from Sharma Global return to origin within 6 days "
                "with less than 1.5% deduction across two distinct cycles, indicating artificial turnover fabrication."
            ),
            severity=FindingSeverity.SEVERE,
            confidence=0.99,
            evidence_refs=["fact_circular_transaction_count"],
            rule_fired="RULE_CIRCULAR_FLOW_CYCLE_DETECTED",
            transaction_ids=all_cycle_txns,
        ),
        Finding(
            id="flag_linked_entities_common_premise",
            stage="fraud_detector",
            title="Common Registered Office and Contact Details across Counterparties",
            description=(
                f"Applicant and its primary buyer Verma Logistics share the identical registered physical address "
                f"({shared_address}). Additionally, counterparty Gupta Trading shares contact phone (+91-9811001122)."
            ),
            severity=FindingSeverity.HIGH,
            confidence=0.96,
            evidence_refs=["fact_shared_registered_address", "fact_shared_contact_phone"],
            rule_fired="RULE_LINKED_FIRM_SHARED_IDENTIFIER",
        ),
        Finding(
            id="flag_outside_world_test_failed",
            stage="fraud_detector",
            title="Failed Outside-World Cash Dissipation Test",
            description=(
                "87.4% of total banking turnover circulates exclusively between these three related entities, "
                "with negligible outward payments to real outside vendors, utility providers, or retail customers."
            ),
            severity=FindingSeverity.HIGH,
            confidence=0.94,
            evidence_refs=["fact_turnover_claimed"],
            rule_fired="RULE_OUTSIDE_WORLD_TEST_FAILED",
            transaction_ids=all_cycle_txns,
        ),
    ])

    # Raw documents
    case.raw_documents.append(
        RawDocument(
            doc_id="doc_ring_bank_statement",
            filename="Axis_Bank_Current_Statement_FY24.pdf",
            doc_type="bank_statement",
            raw_text="Axis Bank Current Account. Payer-to-payee records showing repeated cyclic movements to Verma Logistics and Gupta Trading.",
            extracted_data={"transactions": transactions},
        )
    )

    return case
