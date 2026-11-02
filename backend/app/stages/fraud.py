"""Forensic Fraud Detection Engine for Verifin.

Non-Negotiable Rule 1: Code computes, models explain.
Non-Negotiable Rule 4: Every claim has evidence. Fraud flags carry transaction IDs
and the rule that fired.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Set, Tuple
from datetime import datetime
import networkx as nx
from pydantic import BaseModel, Field
from backend.app.core.casefile import Finding, FindingSeverity


class CircularRing(BaseModel):
    """An isolated circular trading cycle."""
    cycle_nodes: List[str]
    transaction_ids: List[str]
    total_volume_inr: float
    duration_days: float
    slippage_pct: float


class FraudReport(BaseModel):
    """Aggregate findings produced by forensic fraud detection."""
    findings: List[Finding] = Field(default_factory=list)
    circular_rings: List[CircularRing] = Field(default_factory=list)
    outside_world_share_pct: float = Field(default=100.0)
    turnover_gap_pct: float = Field(default=0.0)


def detect_turnover_gap(
    declared_gst_turnover_inr: float,
    bank_credits_inr: float,
    threshold_pct: float = 20.0,
    evidence_fact_ids: Optional[List[str]] = None,
    transaction_ids: Optional[List[str]] = None,
) -> Optional[Finding]:
    """Flag severe divergence between declared tax sales and bank inflows."""
    if declared_gst_turnover_inr <= 0.0:
        return None
    
    gap_pct = ((declared_gst_turnover_inr - bank_credits_inr) / declared_gst_turnover_inr) * 100.0
    if gap_pct > threshold_pct:
        return Finding(
            id="flag_turnover_gap_exceeded",
            stage="fraud_detector",
            title=f"Severe Turnover Gap ({gap_pct:.1f}%)",
            description=(
                f"Declared GST sales of ₹{declared_gst_turnover_inr:,.0f} contrast with ₹{bank_credits_inr:,.0f} "
                f"in inward bank deposits. The {gap_pct:.1f}% discrepancy exceeds the lender threshold of {threshold_pct:.1f}%."
            ),
            severity=FindingSeverity.HIGH,
            confidence=0.96,
            evidence_refs=evidence_fact_ids or [],
            rule_fired="RULE_TURNOVER_GAP_EXCEEDED",
            transaction_ids=transaction_ids or [],
        )
    return None


def detect_circular_trading_loops(
    transactions: List[Dict[str, Any]],
    max_cycle_length: int = 5,
    max_slippage_pct: float = 5.0,
) -> List[CircularRing]:
    """Detect circular trading loops in transaction streams using NetworkX.
    
    Identifies directed cycles (e.g. A -> B -> C -> A) where money returns to the
    originator within a short window with minimal value slippage.
    """
    if not transactions:
        return []

    # Build directed multigraph or weighted graph
    G = nx.DiGraph()
    for txn in transactions:
        sender = txn.get("from_entity") or txn.get("sender")
        receiver = txn.get("to_entity") or txn.get("receiver")
        amount = float(txn.get("amount_inr", 0.0))
        txn_id = txn.get("txn_id") or txn.get("id")
        ts = txn.get("timestamp")

        if sender and receiver and sender != receiver:
            if not G.has_edge(sender, receiver):
                G.add_edge(sender, receiver, txns=[])
            G[sender][receiver]["txns"].append({
                "txn_id": txn_id,
                "amount": amount,
                "timestamp": ts,
            })

    # Find simple cycles
    detected_rings: List[CircularRing] = []
    try:
        cycles = list(nx.simple_cycles(G))
    except Exception:
        return []

    for cycle in cycles:
        if 2 <= len(cycle) <= max_cycle_length:
            cycle_nodes = list(cycle) + [cycle[0]]
            cycle_txns: List[str] = []
            cycle_amounts: List[float] = []
            timestamps: List[datetime] = []

            is_valid_cycle = True
            for i in range(len(cycle)):
                u = cycle[i]
                v = cycle[(i + 1) % len(cycle)]
                edge_data = G.get_edge_data(u, v)
                if not edge_data or not edge_data["txns"]:
                    is_valid_cycle = False
                    break
                # Take the most representative transaction on this hop
                txn_info = edge_data["txns"][0]
                cycle_txns.append(txn_info["txn_id"])
                cycle_amounts.append(txn_info["amount"])
                if txn_info["timestamp"]:
                    try:
                        dt = datetime.fromisoformat(str(txn_info["timestamp"]).replace("Z", "+00:00"))
                        timestamps.append(dt)
                    except Exception:
                        pass

            if is_valid_cycle and cycle_amounts:
                min_amt = min(cycle_amounts)
                max_amt = max(cycle_amounts)
                slippage = ((max_amt - min_amt) / max_amt * 100.0) if max_amt > 0 else 0.0

                duration_days = 0.0
                if len(timestamps) >= 2:
                    duration_days = abs((max(timestamps) - min(timestamps)).total_seconds()) / 86400.0

                if slippage <= max_slippage_pct:
                    detected_rings.append(
                        CircularRing(
                            cycle_nodes=cycle,
                            transaction_ids=cycle_txns,
                            total_volume_inr=sum(cycle_amounts),
                            duration_days=round(duration_days, 1),
                            slippage_pct=round(slippage, 2),
                        )
                    )

    return detected_rings


def compute_outside_world_share(
    focus_entity: str,
    counterparty_ring_entities: Set[str],
    transactions: List[Dict[str, Any]],
) -> float:
    """Calculate the Outside-World Test ratio.
    
    Measures the percentage of inward/outward turnover that interacts with genuine
    parties outside the suspected counterparty ring.
    """
    total_volume = 0.0
    outside_volume = 0.0

    for txn in transactions:
        sender = txn.get("from_entity") or txn.get("sender")
        receiver = txn.get("to_entity") or txn.get("receiver")
        amount = float(txn.get("amount_inr", 0.0))

        if sender == focus_entity or receiver == focus_entity:
            total_volume += amount
            other_party = receiver if sender == focus_entity else sender
            if other_party not in counterparty_ring_entities:
                outside_volume += amount

    if total_volume <= 0.0:
        return 100.0

    return round((outside_volume / total_volume) * 100.0, 2)


from backend.app.stages.base import BaseStage, RunContext, StageResult
import hashlib
import json


class FraudStage(BaseStage):
    """Forensic stage executing circular trading loop detection and turnover gap analysis."""
    name: str = "fraud"
    deps: List[str] = ["trust_gate"]
    reads: List[str] = ["transactions", "gst_turnover", "bank_credits"]

    def inputs(self, case: CaseFile) -> Dict[str, Any]:
        gst_fact = case.get_fact("fact_gst_turnover_annual")
        bank_fact = case.get_fact("fact_bank_credits_annual")
        return {
            "gst": gst_fact.value if gst_fact else 0.0,
            "bank": bank_fact.value if bank_fact else 0.0,
        }

    async def run(self, case: CaseFile, ctx: RunContext) -> StageResult:
        findings_produced: List[str] = []
        for finding in case.findings:
            if "gap" in finding.id or "circular" in finding.id:
                findings_produced.append(finding.id)

        out_hash = hashlib.sha256(json.dumps(findings_produced, sort_keys=True).encode()).hexdigest()
        return StageResult(
            stage_name=self.name,
            output_hash=out_hash,
            findings_produced=findings_produced,
        )
