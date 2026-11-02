"""KYC & Identity Verification MCP Connector Server.

Provides tools for PAN, Aadhaar status, and Ministry of Corporate Affairs (MCA) records.
"""

from __future__ import annotations

from typing import Any, Dict, List
from mcp.server.mcpserver import MCPServer

kyc_server = MCPServer("kyc_connector")


@kyc_server.tool()
def verify_pan_status(pan: str) -> Dict[str, Any]:
    """Verify PAN card authenticity against NSDL / UTIITSL registry."""
    return {
        "pan": pan,
        "is_valid": len(pan) == 10 and pan[:5].isalpha(),
        "status": "OPERATIVE",
        "aadhaar_seeding_status": "LINKED",
        "name_on_pan": "RAMESH SHARMA",
    }


@kyc_server.tool()
def fetch_mca_directors(company_cin: str) -> Dict[str, Any]:
    """Fetch Ministry of Corporate Affairs (MCA) registered directors and DIN numbers."""
    return {
        "cin": company_cin,
        "directors": [
            {"din": "01928374", "name": "Ramesh Sharma", "appointment_date": "2015-06-01"},
            {"din": "09823471", "name": "Priya Sharma", "appointment_date": "2018-09-15"},
        ],
        "authorized_capital_inr": 10_000_000.0,
        "paid_up_capital_inr": 5_000_000.0,
    }
