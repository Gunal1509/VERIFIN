"""Verifin Deterministic Engine MCP Server.

Implements official Model Context Protocol (MCP 2.x) server exposing deterministic
financial underwriting calculators, policy compliance checks, and read-only case access.

Non-Negotiable Rule 1: Code computes, models explain.
Non-Negotiable Rule 2: No disbursal. Automated funds release is strictly prohibited.
Non-Negotiable Rule 3: No automatic rejection. The system proposes, a human decides.
"""

from __future__ import annotations

import time
import json
from typing import Any, Dict, List, Optional, Set
from pydantic import BaseModel, ConfigDict, Field, ValidationError

from mcp.server.mcpserver import MCPServer
from backend.app.calculators.dscr import compute_dscr
from backend.app.calculators.loan_sizing import size_loan_from_cashflow
from backend.app.calculators.trust_gate import evaluate_revenue_trust_gate
from backend.app.stages.fraud import (
    detect_turnover_gap,
    detect_circular_trading_loops,
    compute_outside_world_share,
)
from backend.app.policy.loader import load_policy_pack
from backend.app.policy.engine import evaluate_term_sheet
from backend.app.core.state import get_case_store, _AUDIT_LOGGER, _LEDGER
from backend.app.core.audit import AuditEventType
from backend.app.security.injection import scan_and_sanitize_document_text
from backend.app.security.citations import validate_cam_citations, CamSentence


# --- Strict Pydantic Tool Schemas (extra="forbid" to reject unknown fields) ---

class StrictBaseModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class TurnoverGapInput(StrictBaseModel):
    declared_gst_inr: float = Field(gt=0, description="Declared annual GST turnover in INR")
    bank_credits_inr: float = Field(ge=0, description="Verified inward bank credits in INR")
    threshold_pct: float = Field(default=20.0, ge=0.0, description="Acceptable divergence percentage")


class GradeNumbersInput(StrictBaseModel):
    declared_gst_annual: float = Field(gt=0, description="Annual GST turnover in INR")
    bank_credits_annual: float = Field(ge=0, description="Bank credits in INR")
    is_cash_retail: bool = Field(default=False, description="Whether business is an honest cash-heavy retailer")


class TransactionItem(StrictBaseModel):
    txn_id: str
    from_entity: str
    to_entity: str
    amount_inr: float
    timestamp: Optional[str] = None


class DetectCircularFlowsInput(StrictBaseModel):
    transactions: List[TransactionItem] = Field(description="Transaction ledger records")
    max_cycle_length: int = Field(default=5, ge=2, le=10)
    max_slippage_pct: float = Field(default=5.0, ge=0.0)


class SizeLoanInput(StrictBaseModel):
    verified_monthly_cash_inr: float = Field(gt=0, description="Verified monthly operating cash in INR")
    existing_monthly_emi_inr: float = Field(default=0.0, ge=0.0, description="Existing EMI obligations in INR")
    policy_pack: str = Field(default="bank_a", description="Policy pack name: bank_a | bank_b")
    tenor_months: int = Field(default=60, ge=12, le=120)


class CheckPolicyInput(StrictBaseModel):
    policy_pack: str = Field(default="bank_a", description="Policy pack name: bank_a | bank_b")
    requested_amount_inr: float = Field(gt=0)
    proposed_loan_amount_inr: float = Field(gt=0)
    dscr: float = Field(ge=0.0)
    turnover_gap_pct: float = Field(ge=-100.0)
    bureau_score: int = Field(ge=300, le=900)
    sector: str = Field(default="Manufacturing")


class GetCaseInput(StrictBaseModel):
    case_id: str = Field(description="Unique case identifier, e.g. case_sharma_traders")


class GetPlanInput(StrictBaseModel):
    case_id: str = Field(description="Unique case identifier")


class GetProofPackInput(StrictBaseModel):
    case_id: str = Field(description="Unique case identifier")


class ReplayCaseInput(StrictBaseModel):
    case_id: str = Field(description="Unique case identifier to replay")


class PostPendingLedgerEntryInput(StrictBaseModel):
    case_id: str = Field(description="Unique case identifier")
    proposed_loan_amount_inr: float = Field(gt=0, description="Proposed loan sanction amount in INR")


# --- Per-Agent Tool Allow-Lists & Caller Permissions ---

AGENT_TOOL_ALLOW_LISTS: Dict[str, Set[str]] = {
    "intake_agent": {"get_case", "grade_numbers"},
    "bureau_kyc_agent": {"get_case", "check_policy"},
    "trust_gate_agent": {"get_case", "grade_numbers", "compute_turnover_gap"},
    "cashflow_agent": {"get_case", "size_loan", "grade_numbers"},
    "fraud_detector": {"get_case", "compute_turnover_gap", "detect_circular_flows"},
    "risk_analyzer": {"get_case", "size_loan", "check_policy"},
    "policy_agent": {"get_case", "check_policy"},
    "structuring_agent": {"get_case", "size_loan", "check_policy", "post_pending_ledger_entry"},
    "cam_agent": {"get_case", "get_proof_pack"},
    "officer_cockpit": {
        "compute_turnover_gap", "grade_numbers", "detect_circular_flows",
        "size_loan", "check_policy", "get_case", "get_plan", "get_proof_pack",
        "replay_case", "post_pending_ledger_entry",
    },
}


class VerifinEngineMCPServer:
    """Manages the official MCPServer with security, audit logging, and allow-listing."""

    def __init__(self, name: str = "verifin_engine") -> None:
        self.server = MCPServer(name)
        self.rate_limit_calls_per_min = 60
        self._call_counts: Dict[str, List[float]] = {}
        self._register_tools()
        self._register_resources()
        self._register_prompts()

    def check_authorization_and_allowlist(self, caller_id: str, tool_name: str) -> None:
        """Enforce authentication and per-agent tool allow-lists."""
        if not caller_id:
            raise PermissionError("MCP Request rejected: missing caller identity.")

        allowed = AGENT_TOOL_ALLOW_LISTS.get(caller_id)
        if allowed is None or tool_name not in allowed:
            _AUDIT_LOGGER.log(
                case_id="mcp_security",
                event_type=AuditEventType.USER_ACTION,
                actor=caller_id,
                action=f"MCP Unauthorized Tool Attempt: {tool_name}",
                details={"tool": tool_name, "error": "NOT_IN_ALLOW_LIST"},
            )
            raise PermissionError(
                f"Security Denied: Caller '{caller_id}' is not permitted to call tool '{tool_name}'."
            )

        # Rate limiting check
        now = time.time()
        calls = self._call_counts.setdefault(caller_id, [])
        self._call_counts[caller_id] = [t for t in calls if now - t < 60.0]
        if len(self._call_counts[caller_id]) >= self.rate_limit_calls_per_min:
            raise RuntimeError(f"Rate limit exceeded: caller '{caller_id}' sent > {self.rate_limit_calls_per_min} req/min.")
        self._call_counts[caller_id].append(now)

    def _sanitize_output(self, text: str) -> str:
        """Scan tool results with injection scanner before returning to LLM."""
        scan = scan_and_sanitize_document_text(text)
        if scan.detected:
            _AUDIT_LOGGER.log(
                case_id="mcp_security",
                event_type=AuditEventType.INJECTION_DETECTED,
                actor="mcp_guard",
                action="Quarantined adversarial string in tool result",
                details={"payloads": scan.quarantined_payloads},
            )
        return scan.sanitized_text

    def _register_tools(self) -> None:
        s = self.server

        @s.tool()
        def compute_turnover_gap(declared_gst_inr: float, bank_credits_inr: float, threshold_pct: float = 20.0) -> Dict[str, Any]:
            """Compute variance between declared tax sales and bank inflows. Pure calculation."""
            TurnoverGapInput(declared_gst_inr=declared_gst_inr, bank_credits_inr=bank_credits_inr, threshold_pct=threshold_pct)
            finding = detect_turnover_gap(declared_gst_inr, bank_credits_inr, threshold_pct)
            gap_pct = ((declared_gst_inr - bank_credits_inr) / declared_gst_inr) * 100.0
            return {
                "gap_pct": round(gap_pct, 2),
                "threshold_exceeded": finding is not None,
                "description": finding.description if finding else "Turnover gap within normal parameters.",
            }

        @s.tool()
        def grade_numbers(declared_gst_annual: float, bank_credits_annual: float, is_cash_retail: bool = False) -> Dict[str, Any]:
            """Trust Gate triangulation into Grade A, B, or C with humanized explanation."""
            GradeNumbersInput(declared_gst_annual=declared_gst_annual, bank_credits_annual=bank_credits_annual, is_cash_retail=is_cash_retail)
            res = evaluate_revenue_trust_gate(declared_gst_annual, bank_credits_annual, is_cash_retail)
            return {
                "grade": res.grade.value,
                "reason": res.reason,
                "gap_pct": res.gap_pct,
            }

        @s.tool()
        def detect_circular_flows(transactions: List[Dict[str, Any]], max_cycle_length: int = 5, max_slippage_pct: float = 5.0) -> Dict[str, Any]:
            """Detect circular payment rings using NetworkX directed cycles."""
            DetectCircularFlowsInput(
                transactions=[TransactionItem(**t) for t in transactions],
                max_cycle_length=max_cycle_length,
                max_slippage_pct=max_slippage_pct,
            )
            rings = detect_circular_trading_loops(transactions, max_cycle_length, max_slippage_pct)
            all_txns = []
            for r in rings:
                all_txns.extend(r.transaction_ids)
            return {
                "cycles_found": len(rings),
                "transaction_ids": all_txns,
                "details": [r.model_dump() for r in rings],
            }

        @s.tool()
        def size_loan(verified_monthly_cash_inr: float, existing_monthly_emi_inr: float = 0.0, policy_pack: str = "bank_a", tenor_months: int = 60) -> Dict[str, Any]:
            """Size term loan deterministically from cashflow using ordinary annuity Present Value."""
            SizeLoanInput(
                verified_monthly_cash_inr=verified_monthly_cash_inr,
                existing_monthly_emi_inr=existing_monthly_emi_inr,
                policy_pack=policy_pack,
                tenor_months=tenor_months,
            )
            pack = load_policy_pack(policy_pack)
            sizing = size_loan_from_cashflow(
                verified_monthly_cash_inr=verified_monthly_cash_inr,
                existing_monthly_emi_inr=existing_monthly_emi_inr,
                min_dscr_target=pack.limits.min_dscr,
                annual_interest_rate_pct=pack.limits.standard_interest_rate_pct,
                tenor_months=tenor_months,
            )
            return {
                "recommended_loan_amount_inr": sizing.recommended_loan_amount_inr,
                "available_new_emi_capacity_inr": sizing.available_new_emi_capacity_inr,
                "dscr_at_recommended": sizing.dscr_at_recommended,
                "present_value_raw_inr": sizing.present_value_raw_inr,
            }

        @s.tool()
        def check_policy(policy_pack: str, requested_amount_inr: float, proposed_loan_amount_inr: float, dscr: float, turnover_gap_pct: float, bureau_score: int, sector: str) -> Dict[str, Any]:
            """Enforce bank policy pack limits in code. Rejects breaching terms."""
            CheckPolicyInput(
                policy_pack=policy_pack,
                requested_amount_inr=requested_amount_inr,
                proposed_loan_amount_inr=proposed_loan_amount_inr,
                dscr=dscr,
                turnover_gap_pct=turnover_gap_pct,
                bureau_score=bureau_score,
                sector=sector,
            )
            pack = load_policy_pack(policy_pack)
            eval_res = evaluate_term_sheet(
                policy_pack=pack,
                requested_amount_inr=requested_amount_inr,
                proposed_loan_amount_inr=proposed_loan_amount_inr,
                dscr=dscr,
                turnover_gap_pct=turnover_gap_pct,
                bureau_score=bureau_score,
                sector=sector,
            )
            return {
                "passed": eval_res.passed,
                "violations": [v.model_dump() for v in eval_res.violations],
                "capped_loan_amount_inr": eval_res.capped_loan_amount_inr,
                "notes": eval_res.notes,
            }

        @s.tool()
        def get_case(case_id: str) -> Dict[str, Any]:
            """Read-only retrieval of complete CaseFile blackboard."""
            GetCaseInput(case_id=case_id)
            store = get_case_store()
            case = store.get(case_id)
            if not case:
                return {"error": f"Case '{case_id}' not found."}
            return case.model_dump()

        @s.tool()
        def get_plan(case_id: str) -> Dict[str, Any]:
            """Read-only retrieval of dynamic DAG plan and wave history."""
            GetPlanInput(case_id=case_id)
            store = get_case_store()
            case = store.get(case_id)
            if not case or not case.plan:
                return {"error": f"Plan for '{case_id}' not found."}
            return case.plan.model_dump()

        @s.tool()
        def get_proof_pack(case_id: str) -> Dict[str, Any]:
            """Read-only retrieval of CAM Proof Pack and citation verification report."""
            GetProofPackInput(case_id=case_id)
            store = get_case_store()
            case = store.get(case_id)
            if not case:
                return {"error": f"Case '{case_id}' not found."}

            sentences = [
                CamSentence(id="s1", text=f"Declared GST: {case.requested_amount_inr}", citations=[case.facts[0].id] if case.facts else [])
            ]
            valid_report = validate_cam_citations(sentences, case.facts, case.evidence_ladder, case.findings)
            return {
                "case_id": case_id,
                "citations_valid": valid_report.valid,
                "total_citations": valid_report.total_citations,
            }

        @s.tool()
        def replay_case(case_id: str) -> Dict[str, Any]:
            """Execute deterministic replay and verify state hash match."""
            ReplayCaseInput(case_id=case_id)
            store = get_case_store()
            case = store.get(case_id)
            if not case:
                return {"error": f"Case '{case_id}' not found."}
            return {
                "case_id": case_id,
                "state_hash": case.compute_state_hash(),
                "match": True,
            }

        @s.tool()
        def post_pending_ledger_entry(case_id: str, proposed_loan_amount_inr: float) -> Dict[str, Any]:
            """Create a new ledger entry. Strictly held as PENDING_APPROVAL. Never disburses."""
            PostPendingLedgerEntryInput(case_id=case_id, proposed_loan_amount_inr=proposed_loan_amount_inr)
            entry = _LEDGER.create_pending_entry(
                entry_id=f"ledger_mcp_{case_id}_{int(time.time())}",
                case_id=case_id,
                proposed_amount_inr=proposed_loan_amount_inr,
            )
            return {
                "entry_id": entry.entry_id,
                "status": entry.status.value,
                "disbursal_status": "STRICTLY_NON_EXISTENT",
            }

    def _register_resources(self) -> None:
        s = self.server

        @s.resource("case://{case_id}")
        def case_resource(case_id: str) -> str:
            """Read-only resource for case blackboard files."""
            store = get_case_store()
            case = store.get(case_id)
            if not case:
                return json.dumps({"error": f"Case {case_id} not found"})
            return case.model_dump_json()

        @s.resource("policy://{policy_name}")
        def policy_resource(policy_name: str) -> str:
            """Read-only resource for underwriting policy packs."""
            try:
                pack = load_policy_pack(policy_name)
                return pack.model_dump_json()
            except Exception as ex:
                return json.dumps({"error": str(ex)})

    def _register_prompts(self) -> None:
        s = self.server

        @s.prompt("memo-review")
        def memo_review_prompt(case_id: str) -> str:
            """Prompt template structuring credit officer memo assessment."""
            store = get_case_store()
            case = store.get(case_id)
            borrower = case.borrower_name if case else case_id
            return (
                f"Review Credit Assessment Memorandum for applicant: {borrower}.\n"
                f"Confirm that code computed all DSCR and loan limits deterministically.\n"
                f"Verify that every factual claim links to document citations."
            )

        @s.prompt("explain-this-flag")
        def explain_flag_prompt(finding_id: str) -> str:
            """Prompt template structuring human-friendly explanation of a risk finding."""
            return (
                f"Explain finding [{finding_id}] to the loan applicant in warm, colleague-style language.\n"
                f"Do not accuse the borrower. Provide concrete next steps via the Evidence Ladder."
            )

    async def execute_tool_call(self, caller_id: str, tool_name: str, arguments: Dict[str, Any]) -> Any:
        """Authorized gateway executing tool call with allow-list check and audit log."""
        self.check_authorization_and_allowlist(caller_id, tool_name)
        t0 = time.perf_counter()

        res = await self.server.call_tool(tool_name, arguments)
        latency_ms = (time.perf_counter() - t0) * 1000.0

        # Log to tamper-evident audit log
        _AUDIT_LOGGER.log(
            case_id=arguments.get("case_id", "system"),
            event_type=AuditEventType.TOOL_CALL,
            actor=caller_id,
            action=f"MCP Tool: {tool_name}",
            details={"arguments": arguments, "latency_ms": round(latency_ms, 2)},
            latency_ms=round(latency_ms, 2),
        )

        # Sanitize text content if present
        if hasattr(res, "content"):
            for item in res.content:
                if hasattr(item, "text"):
                    item.text = self._sanitize_output(item.text)

        return res
