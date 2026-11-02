"""Credit Bureau (CIBIL / Experian) MCP Connector Server.

Provides tools for fetching commercial enterprise tradeline history
and personal proprietor/director credit scores.
"""

from __future__ import annotations

from typing import Any, Dict
from mcp.server.mcpserver import MCPServer

bureau_server = MCPServer("credit_bureau_connector")


@bureau_server.tool()
def fetch_commercial_cibil(company_pan: str) -> Dict[str, Any]:
    """Retrieve Commercial CIBIL rank, active credit facilities, and DPD delinquency history."""
    return {
        "pan": company_pan,
        "commercial_rank": 710 if "AAA" in company_pan else 760,
        "active_credit_facilities_count": 2,
        "total_sanctioned_amount_inr": 2_500_000.0,
        "current_outstanding_inr": 1_200_000.0,
        "overdue_amount_inr": 0.0,
        "dpd_0_to_30_last_24m": 0,
        "wilful_default_record": False,
    }


@bureau_server.tool()
def fetch_director_bureau_score(director_pan: str) -> Dict[str, Any]:
    """Retrieve consumer credit bureau score for proprietor or managing directors."""
    return {
        "director_pan": director_pan,
        "cibil_score": 725,
        "enquiries_last_6m": 2,
        "unsecured_loan_exposure_inr": 350_000.0,
        "risk_tier": "PRIME",
    }
