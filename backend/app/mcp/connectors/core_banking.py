"""Core Banking System (CBS) MCP Connector Server.

Provides tools for fetching verified primary current account bank statements
and placing temporary pre-sanction holds.

Non-Negotiable Rule 2: Strictly Read and Post-Pending Only.
No tool exists to disburse or release money.
"""

from __future__ import annotations

from typing import Any, Dict, List
from mcp.server.mcpserver import MCPServer

core_banking_server = MCPServer("core_banking_connector")


@core_banking_server.tool()
def fetch_bank_statements(account_number: str, months_count: int = 12) -> Dict[str, Any]:
    """Retrieve verified operating bank statement summaries from core banking system."""
    credits = 12_000_000.0 if "4490" in account_number else 20_120_000.0
    debits = 11_850_000.0 if "4490" in account_number else 19_870_000.0
    return {
        "account_number": account_number,
        "bank_name": "State Bank of India",
        "account_type": "CURRENT",
        "statement_period_months": months_count,
        "total_inward_credits_inr": credits,
        "total_outward_debits_inr": debits,
        "net_inflow_inr": credits - debits,
        "cheque_returns_inward": 0,
        "cheque_returns_outward": 1,
        "average_monthly_balance_inr": 280_000.0,
    }


@core_banking_server.tool()
def place_pending_credit_hold(account_number: str, amount_inr: float, case_id: str) -> Dict[str, Any]:
    """Place a temporary pre-approval administrative hold on funds capacity.
    
    NON-NEGOTIABLE RULE 2: Read and Hold only. Never disburses or releases funds.
    """
    return {
        "hold_id": f"HOLD_CBS_{case_id[:8]}",
        "account_number": account_number,
        "hold_amount_inr": amount_inr,
        "status": "HELD_PENDING_APPROVAL",
        "disbursal_route": "STRICTLY_LOCKED_NON_EXISTENT",
    }
