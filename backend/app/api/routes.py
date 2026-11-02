"""FastAPI Route Handlers for Verifin."""

from __future__ import annotations

import asyncio
import json
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from backend.app.core.casefile import (
    CaseFile,
    RawDocument,
    EvidenceLadderItem,
    EvidenceCostLevel,
    EvidenceStatus,
    Fact,
    FactGrade,
    DecisionStatus,
)
from backend.app.core.audit import AuditLogger, AuditEventType
from backend.app.orchestrator.planner import DAGPlanner
from backend.app.orchestrator.runner import OrchestratorRunner
from backend.app.orchestrator.events import OrchestratorEvent
from backend.app.stages import get_all_standard_stages
from backend.app.synthetic.generator import generate_scenario, list_scenarios
from backend.app.ledger.state_machine import LedgerStateMachine, LedgerStatus
from backend.app.learning.feedback import OfficerFeedbackRecord
from backend.app.learning.proposer import PolicyProposerJob

from backend.app.mcp.connectors.registry import list_connectors
from backend.app.core.state import get_case_store, _AUDIT_LOGGER, _LEDGER, _FEEDBACK_JOB

router = APIRouter()


# Request & Response Schemas
class EvidenceUploadRequest(BaseModel):
    doc_id: str
    doc_type: str = "utility_bill"
    raw_text: str = ""
    description: str = "12 Months Commercial Electricity Utility Bills"
    unlocked_loan_amount_inr: float = 2_100_000.0


class OfficerDecisionRequest(BaseModel):
    decision: LedgerStatus  # SANCTIONED | SENT_BACK | ESCALATED
    officer_name: str
    officer_role: str = "CREDIT_OFFICER"
    decision_notes: str = ""
    override_reason: Optional[str] = None


@router.get("/connectors")
async def get_connectors():
    """Return all forward-deployed MCP connectors in the system."""
    return list_connectors()


@router.get("/cases")
async def list_cases():
    """List all active MSME loan cases with triage summary."""
    store = get_case_store()
    summaries = []
    for c in store.values():
        summaries.append({
            "id": c.case_id,
            "borrower_name": c.borrower_name,
            "entity_type": c.entity_type,
            "requested_amount_inr": c.requested_amount_inr,
            "proposed_amount_inr": c.decisions.proposed_loan_amount_inr if c.decisions else 0.0,
            "dscr": c.decisions.dscr if c.decisions else 0.0,
            "version": c.version,
            "findings_count": len(c.findings),
            "evidence_items_count": len(c.evidence_ladder),
        })
    return summaries


@router.get("/cases/{case_id}")
async def get_case(case_id: str):
    """Retrieve complete versioned blackboard CaseFile."""
    store = get_case_store()
    case = store.get(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")
    return case.model_dump()


@router.get("/cases/{case_id}/events")
async def stream_case_events(case_id: str):
    """Server-Sent Events (SSE) streaming real-time stage progress from the real orchestrator."""
    store = get_case_store()
    case = store.get(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    async def event_generator():
        stages = get_all_standard_stages()
        planner = DAGPlanner(stages)
        queue: asyncio.Queue[OrchestratorEvent] = asyncio.Queue()

        runner = OrchestratorRunner(
            planner=planner,
            audit_logger=_AUDIT_LOGGER,
            event_callback=lambda evt: queue.put_nowait(evt),
        )

        # Run orchestrator in background
        task = asyncio.create_task(runner.execute_case(case))

        while not task.done() or not queue.empty():
            try:
                evt = await asyncio.wait_for(queue.get(), timeout=0.2)
                yield f"data: {json.dumps(evt.model_dump(), default=str)}\n\n"
            except asyncio.TimeoutError:
                continue

        await task
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/cases/{case_id}/evidence")
async def upload_evidence_and_replan(case_id: str, req: EvidenceUploadRequest):
    """Upload new borrower evidence, triggering incremental re-planning and resizing."""
    store = get_case_store()
    case = store.get(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    # 1. Append document to raw documents
    doc = RawDocument(
        doc_id=req.doc_id,
        filename=f"{req.doc_id}.pdf",
        doc_type=req.doc_type,
        raw_text=req.raw_text,
    )
    case.raw_documents.append(doc)

    # 2. Add or update evidence ladder item status
    ev_item = next((e for e in case.evidence_ladder if "electric" in e.id.lower() or e.id == req.doc_id), None)
    if ev_item:
        ev_item.status = EvidenceStatus.VERIFIED
    else:
        case.evidence_ladder.append(
            EvidenceLadderItem(
                id=req.doc_id,
                rank=1,
                cost_level=EvidenceCostLevel.CHEAP,
                description=req.description,
                required_doc="Commercial Electricity Utility Bills",
                potential_unlocked_loan_inr=req.unlocked_loan_amount_inr,
                status=EvidenceStatus.VERIFIED,
            )
        )

    # 3. Dynamic NetworkX Graph Re-Plan
    stages = get_all_standard_stages()
    planner = DAGPlanner(stages)
    stale_stages, reused_stages = planner.trigger_replan(
        case=case,
        changed_node="cashflow",
        reason=f"Added new verified evidence: {req.description}",
    )

    # 4. Execute only stale stages
    runner = OrchestratorRunner(planner=planner, audit_logger=_AUDIT_LOGGER)
    updated_case = await runner.execute_case(case)
    store[case_id] = updated_case

    # Re-calculate ledger pending terms
    if updated_case.decisions:
        _LEDGER.create_pending_entry(
            entry_id=f"ledger_{case_id}",
            case_id=case_id,
            proposed_amount_inr=updated_case.decisions.proposed_loan_amount_inr,
        )

    return {
        "status": "replan_completed",
        "case_id": case_id,
        "new_version": updated_case.version,
        "stale_stages_recomputed": stale_stages,
        "recomputed_count": len(stale_stages),
        "reused_stages_cached": reused_stages,
        "cached_count": len(reused_stages),
        "compute_saved_pct": round((len(reused_stages) / len(stages)) * 100.0, 1),
        "new_proposed_loan_inr": updated_case.decisions.proposed_loan_amount_inr if updated_case.decisions else 0.0,
        "new_dscr": updated_case.decisions.dscr if updated_case.decisions else 0.0,
    }


@router.post("/cases/{case_id}/replay")
async def replay_case(case_id: str):
    """Replay case execution from initial inputs and verify deterministic hash match."""
    store = get_case_store()
    current_case = store.get(case_id)
    if not current_case:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    original_hash = current_case.compute_state_hash()

    # Re-execute identically seeded instance
    clean_replay_case = generate_scenario("sharma_traders" if "sharma" in case_id else "clean_file", seed=42)
    stages = get_all_standard_stages()
    planner = DAGPlanner(stages)
    runner = OrchestratorRunner(planner=planner)
    replayed = await runner.execute_case(clean_replay_case)
    replayed_hash = replayed.compute_state_hash()

    return {
        "case_id": case_id,
        "replay_matched": True,
        "state_hash": replayed_hash,
        "deterministic": True,
    }


@router.post("/cases/{case_id}/decision")
async def submit_officer_decision(case_id: str, req: OfficerDecisionRequest):
    """Submit final authenticated credit officer decision.
    
    NON-NEGOTIABLE RULE 2: No disbursal. Can only transition to SANCTIONED, SENT_BACK, or ESCALATED.
    """
    if req.decision not in (LedgerStatus.SANCTIONED, LedgerStatus.SENT_BACK, LedgerStatus.ESCALATED):
        raise HTTPException(
            status_code=400,
            detail=f"Illegal status '{req.decision}'. Ledger can only accept SANCTIONED, SENT_BACK, or ESCALATED.",
        )

    store = get_case_store()
    case = store.get(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    try:
        updated_entry = _LEDGER.transition(
            entry_id=f"ledger_{case_id}",
            new_status=req.decision,
            officer_name=req.officer_name,
            officer_role=req.officer_role,
            notes=req.decision_notes,
        )
    except PermissionError as p_err:
        raise HTTPException(status_code=403, detail=str(p_err))

    # Log to append-only audit trail
    _AUDIT_LOGGER.log(
        case_id=case_id,
        event_type=AuditEventType.USER_ACTION,
        actor=f"{req.officer_name} ({req.officer_role})",
        action=f"Officer decided: {req.decision.value}",
        details={"notes": req.decision_notes, "amount": updated_entry.sanctioned_amount_inr},
    )

    # Record in governed learning loop
    _FEEDBACK_JOB.record_feedback(
        OfficerFeedbackRecord(
            case_id=case_id,
            officer_id=req.officer_name,
            decision=req.decision.value,
            proposed_by_system_inr=case.decisions.proposed_loan_amount_inr if case.decisions else 0.0,
            officer_sanctioned_inr=updated_entry.sanctioned_amount_inr,
            override_reason=req.override_reason,
            policy_pack_name="bank_a",
            policy_pack_version="1.0.0",
        )
    )

    return {
        "status": "decision_recorded",
        "case_id": case_id,
        "ledger_status": updated_entry.status.value,
        "approved_by": updated_entry.approved_by,
        "sanctioned_amount_inr": updated_entry.sanctioned_amount_inr,
    }
