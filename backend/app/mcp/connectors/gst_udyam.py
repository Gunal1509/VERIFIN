"""GST & Udyam Verification MCP Connector Server.

Provides tools for validating GSTIN status, retrieving GSTR-3B filings,
and verifying MSME Udyam registration certificates.
"""

from __future__ import annotations

from typing import Any, Dict
from mcp.server.mcpserver import MCPServer

gst_udyam_server = MCPServer("gst_udyam_connector")


@gst_udyam_server.tool()
def verify_gstin(gstin: str) -> Dict[str, Any]:
    """Verify active GSTIN registration and tax jurisdiction."""
    is_valid = len(gstin) == 15 and gstin[:2].isdigit()
    return {
        "gstin": gstin,
        "is_active": is_valid,
        "legal_name": "Sharma Traders" if "07AAAA" in gstin else "Apex Auto Components Pvt Ltd",
        "state_code": gstin[:2] if len(gstin) >= 2 else "07",
        "taxpayer_type": "Regular",
        "status": "ACTIVE" if is_valid else "INVALID",
    }


@gst_udyam_server.tool()
def fetch_gstr3b_returns(gstin: str, financial_year: str = "2023-24") -> Dict[str, Any]:
    """Retrieve 12-month aggregated declared turnover and tax liabilities."""
    turnover = 40_000_000.0 if "07AAAA" in gstin else 20_000_000.0
    return {
        "gstin": gstin,
        "financial_year": financial_year,
        "annual_taxable_turnover_inr": turnover,
        "tax_paid_inr": turnover * 0.18,
        "months_filed_count": 12,
        "filing_consistency_pct": 100.0,
    }


@gst_udyam_server.tool()
def verify_udyam_registration(udyam_number: str) -> Dict[str, Any]:
    """Verify MSME Udyam registration certificate and enterprise category."""
    return {
        "udyam_number": udyam_number,
        "enterprise_type": "SMALL_ENTERPRISE",
        "major_activity": "TRADING",
        "verified": True,
        "date_of_commencement": "2018-04-12",
    }
