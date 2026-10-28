"""Append-Only Audit Log for MSME Underwriting Copilot.

Guarantees non-repudiation and complete traceability for every model invocation,
tool call, policy execution, user decision, and detected injection attempt.
Historical entries are strictly append-only and immutable.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class AuditEventType(str, Enum):
    """Event classifications in the audit log."""
    TOOL_CALL = "TOOL_CALL"
    MODEL_CALL = "MODEL_CALL"
    STAGE_TRANSITION = "STAGE_TRANSITION"
    REPLAN_TRIGGERED = "REPLAN_TRIGGERED"
    USER_ACTION = "USER_ACTION"
    INJECTION_DETECTED = "INJECTION_DETECTED"
    POLICY_EVALUATION = "POLICY_EVALUATION"


class AuditEntry(BaseModel):
    """An individual, immutable audit event record."""
    model_config = ConfigDict(frozen=True)  # Pydantic immutability: entries cannot be mutated once created

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    case_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    event_type: AuditEventType
    actor: str = Field(description="Stage name, agent id, or officer username")
    action: str = Field(description="Brief human-readable summary of the action")
    details: Dict[str, Any] = Field(default_factory=dict, description="Input/output details, arguments, rule info")
    prompt_tokens: int = Field(default=0, ge=0)
    completion_tokens: int = Field(default=0, ge=0)
    total_tokens: int = Field(default=0, ge=0)
    latency_ms: float = Field(default=0.0, ge=0.0)


class AuditLogger:
    """In-memory and persistent append-only log manager."""

    def __init__(self, entries: Optional[List[AuditEntry]] = None) -> None:
        self._entries: List[AuditEntry] = list(entries or [])

    @property
    def entries(self) -> List[AuditEntry]:
        """Return a copy of all audit entries."""
        return list(self._entries)

    def log(
        self,
        case_id: str,
        event_type: AuditEventType,
        actor: str,
        action: str,
        details: Optional[Dict[str, Any]] = None,
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
        latency_ms: float = 0.0,
    ) -> AuditEntry:
        """Atomically append a new immutable event to the log."""
        total_tokens = prompt_tokens + completion_tokens
        entry = AuditEntry(
            case_id=case_id,
            event_type=event_type,
            actor=actor,
            action=action,
            details=details or {},
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            latency_ms=latency_ms,
        )
        self._entries.append(entry)
        return entry

    def filter_by_case(self, case_id: str) -> List[AuditEntry]:
        """Return entries associated with a specific case."""
        return [e for e in self._entries if e.case_id == case_id]

    def filter_by_event(self, event_type: AuditEventType) -> List[AuditEntry]:
        """Return entries matching an event type."""
        return [e for e in self._entries if e.event_type == event_type]

    def total_tokens_used(self, case_id: Optional[str] = None) -> int:
        """Compute aggregate token consumption."""
        targets = self.filter_by_case(case_id) if case_id else self._entries
        return sum(e.total_tokens for e in targets)
