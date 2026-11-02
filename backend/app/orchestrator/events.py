"""Typed event schema for Verifin's dynamic orchestrator.

Emits structured real-time events for every stage transition, wave boundary,
re-plan event, objection, and case completion.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class OrchestratorEventType(str, Enum):
    PLAN_BUILT = "plan_built"
    WAVE_STARTED = "wave_started"
    STAGE_STARTED = "stage_started"
    STAGE_FINISHED = "stage_finished"
    STAGE_SKIPPED = "stage_skipped"
    STAGE_REUSED = "stage_reused"
    REPLAN = "replan"
    OBJECTION = "objection"
    EARLY_EXIT = "early_exit"
    CASE_DONE = "case_done"


class OrchestratorEvent(BaseModel):
    """An individual lifecycle event emitted by the orchestrator."""
    event_type: OrchestratorEventType
    case_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    wave_index: Optional[int] = None
    stage_name: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)
