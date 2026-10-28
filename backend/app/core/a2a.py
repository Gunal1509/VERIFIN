"""Agent-to-Agent (A2A) Message Schema for MSME Underwriting Copilot.

Enables structured, auditable communication between specialized stage agents
(e.g., fraud detector requesting corroboration from cashflow analyzer).
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List
from pydantic import BaseModel, ConfigDict, Field


class A2AMessageType(str, Enum):
    """Types of inter-agent messages."""
    FINDING = "finding"                    # Sharing an extracted fact or calculated flag
    OBJECTION = "objection"                # Challenging a claim made by another stage
    REQUEST_EVIDENCE = "request_evidence"  # Requesting missing corroboration
    RESOLVE = "resolve"                    # Resolving a prior objection with evidence


class A2AMessage(BaseModel):
    """Structured message passed between analytical agents."""
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_agent: str = Field(alias="from", description="Name of sender stage or agent")
    to_agent: str = Field(alias="to", description="Target stage or agent")
    type: A2AMessageType = Field(description="Message type")
    case_id: str = Field(description="ID of the case being analyzed")
    refs: List[str] = Field(default_factory=list, description="Referenced txn_ids, doc_ids, or fact_ids")
    payload: Dict[str, Any] = Field(default_factory=dict, description="Structured message body")
    trace_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Trace identifier")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
