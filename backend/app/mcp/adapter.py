"""MCP Client Adapter for Verifin Stage Agents.

Provides a unified interface allowing Intake and Bureau agents to invoke
either local in-memory engines or forward-deployed MCP connector servers.
Swapping a mock for a real bank connector is strictly a configuration change.
"""

from __future__ import annotations

import os
from typing import Any, Dict, Optional
from backend.app.mcp.connectors.gst_udyam import gst_udyam_server
from backend.app.mcp.connectors.credit_bureau import bureau_server
from backend.app.mcp.connectors.kyc import kyc_server
from backend.app.mcp.connectors.core_banking import core_banking_server
from backend.app.security.injection import scan_and_sanitize_document_text
from backend.app.core.audit import AuditLogger, AuditEventType


class MCPClientAdapter:
    """Unified client adapter consuming MCP connector servers."""

    def __init__(
        self,
        use_remote_mcp: bool = False,
        audit_logger: Optional[AuditLogger] = None,
    ) -> None:
        self.use_remote_mcp = use_remote_mcp or (os.getenv("USE_MCP_CONNECTORS", "false").lower() == "true")
        self.audit_logger = audit_logger or AuditLogger()

    async def fetch_tax_filings(self, gstin: str) -> Dict[str, Any]:
        """Fetch GST returns through GST MCP connector."""
        res = await gst_udyam_server.call_tool("fetch_gstr3b_returns", {"gstin": gstin})
        structured = res.structured_content or {}
        return structured

    async def fetch_bureau_report(self, company_pan: str) -> Dict[str, Any]:
        """Fetch commercial CIBIL score through Bureau MCP connector."""
        res = await bureau_server.call_tool("fetch_commercial_cibil", {"company_pan": company_pan})
        structured = res.structured_content or {}
        return structured

    async def fetch_bank_credits(self, account_number: str) -> Dict[str, Any]:
        """Fetch bank credits through Core Banking MCP connector."""
        res = await core_banking_server.call_tool("fetch_bank_statements", {"account_number": account_number, "months_count": 12})
        structured = res.structured_content or {}
        return structured

    def sanitize_connector_payload(self, raw_payload: str) -> str:
        """Sanitize connector text payloads to prevent prompt injection."""
        scan = scan_and_sanitize_document_text(raw_payload)
        if scan.detected:
            self.audit_logger.log(
                case_id="mcp_adapter",
                event_type=AuditEventType.INJECTION_DETECTED,
                actor="mcp_adapter",
                action="Neutralized adversarial payload in connector stream",
                details={"payloads": scan.quarantined_payloads},
            )
        return scan.sanitized_text
