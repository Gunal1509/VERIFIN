"""Forward-Deployed Connector Registry for Verifin.

Exposes metadata for all connected banking and regulatory data sources:
Name, Tools Offered, Access Permissions, and Mock/Real Status.
"""

from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class ConnectorMetadata(BaseModel):
    id: str
    name: str
    category: str
    status: Literal["mock", "real"]
    permissions: List[str]
    tools_offered: List[str]
    description: str
    latency_sla_ms: int
    endpoint: Optional[str] = None
    transport: Optional[str] = None
    security_scope: Optional[str] = None
    trust_grade: Optional[str] = "Grade A"
    verified_token: Optional[str] = None


CONNECTORS_REGISTRY: List[ConnectorMetadata] = [
    ConnectorMetadata(
        id="gst_udyam",
        name="GST & Udyam Portal Connector",
        category="Tax & Regulatory",
        status="mock",
        permissions=["READ_FILINGS", "VERIFY_REGISTRATION"],
        tools_offered=["verify_gstin", "fetch_gstr3b_returns", "verify_udyam_registration"],
        description="Direct API connector for CBIC GSTR-3B filings and MSME Udyam credentials.",
        latency_sla_ms=450,
    ),
    ConnectorMetadata(
        id="credit_bureau",
        name="Commercial Credit Bureau Connector",
        category="Credit History",
        status="mock",
        permissions=["READ_TRADELINES", "PULL_CIBIL_SCORE"],
        tools_offered=["fetch_commercial_cibil", "fetch_director_bureau_score"],
        description="Automated pull for commercial CIBIL score, active facilities, and DPD delinquency records.",
        latency_sla_ms=350,
    ),
    ConnectorMetadata(
        id="kyc_mca",
        name="KYC & MCA Registry Connector",
        category="Identity & Incorporation",
        status="mock",
        permissions=["VERIFY_PAN", "VERIFY_DIRECTORS"],
        tools_offered=["verify_pan_status", "fetch_mca_directors"],
        description="Cross-references NSDL PAN seeding and Ministry of Corporate Affairs director DINs.",
        latency_sla_ms=300,
    ),
    ConnectorMetadata(
        id="core_banking",
        name="Core Banking System (CBS) Connector",
        category="Banking & Inflows",
        status="mock",
        permissions=["READ_ONLY_STATEMENTS", "POST_PENDING_HOLD"],
        tools_offered=["fetch_bank_statements", "place_pending_credit_hold"],
        description="Pulls 12-month verified e-statements and places administrative credit holds. Strictly zero disbursal.",
        latency_sla_ms=250,
    ),
    ConnectorMetadata(
        id="document_store",
        name="Encrypted Document Store Connector",
        category="Storage & Provenance",
        status="mock",
        permissions=["READ_ENCRYPTED_DOC"],
        tools_offered=["retrieve_document"],
        description="Retrieves primary filing PDFs with cryptographic SHA-256 tamper-evident integrity.",
        latency_sla_ms=180,
    ),
]


def list_connectors() -> List[Dict[str, Any]]:
    """Return list of all registered connectors with metadata."""
    return [c.model_dump() for c in CONNECTORS_REGISTRY]


def register_dynamic_connector(connector: ConnectorMetadata) -> ConnectorMetadata:
    """Dynamically register a newly verified bank or partner connector."""
    # Check if id already exists; update if so
    for idx, existing in enumerate(CONNECTORS_REGISTRY):
        if existing.id == connector.id:
            CONNECTORS_REGISTRY[idx] = connector
            return connector
    CONNECTORS_REGISTRY.append(connector)
    return connector

