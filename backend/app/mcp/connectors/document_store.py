"""Document Store MCP Connector Server.

Provides tools for fetching untrusted document payloads, metadata, and cryptographic hashes.
"""

from __future__ import annotations

import hashlib
from typing import Any, Dict
from mcp.server.mcpserver import MCPServer

doc_store_server = MCPServer("doc_store_connector")


@doc_store_server.tool()
def retrieve_document(doc_id: str) -> Dict[str, Any]:
    """Retrieve document metadata and cryptographic SHA-256 integrity hash."""
    sample_text = f"Filing payload document contents for reference {doc_id}."
    doc_hash = hashlib.sha256(sample_text.encode("utf-8")).hexdigest()
    return {
        "doc_id": doc_id,
        "filename": f"{doc_id}.pdf",
        "sha256_hash": doc_hash,
        "page_count": 12,
        "content_type": "application/pdf",
        "is_tamper_evident": True,
    }
