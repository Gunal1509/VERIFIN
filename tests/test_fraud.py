"""Unit tests for forensic fraud detectors."""

import pytest
from backend.app.stages.fraud import (
    detect_turnover_gap,
    detect_circular_trading_loops,
    compute_outside_world_share,
)
from backend.app.core.casefile import FindingSeverity


def test_turnover_gap_detector():
    # 1. Clean Case: ₹2.0 Cr declared vs ₹2.012 Cr bank inflow -> No flag
    flag_clean = detect_turnover_gap(20_000_000.0, 20_120_000.0, threshold_pct=20.0)
    assert flag_clean is None

    # 2. Sharma Traders: ₹4.0 Cr declared vs ₹1.2 Cr bank inflow -> 70% gap flagged
    flag_sharma = detect_turnover_gap(
        declared_gst_turnover_inr=40_000_000.0,
        bank_credits_inr=12_000_000.0,
        threshold_pct=20.0,
        evidence_fact_ids=["fact_gst_turnover", "fact_bank_credits"],
        transaction_ids=["TXN_SBI_44901", "TXN_SBI_44922"],
    )
    assert flag_sharma is not None
    assert flag_sharma.rule_fired == "RULE_TURNOVER_GAP_EXCEEDED"
    assert flag_sharma.severity == FindingSeverity.HIGH
    assert len(flag_sharma.transaction_ids) == 2


def test_networkx_circular_trading_detection():
    # Build simulated circular transactions:
    # Sharma Traders -> Verma Textiles -> Gupta Logistics -> Sharma Traders
    transactions = [
        {
            "txn_id": "TXN_RING_001",
            "from_entity": "Sharma Traders",
            "to_entity": "Verma Textiles",
            "amount_inr": 4_500_000.0,
            "timestamp": "2024-03-01T10:00:00Z",
        },
        {
            "txn_id": "TXN_RING_002",
            "from_entity": "Verma Textiles",
            "to_entity": "Gupta Logistics",
            "amount_inr": 4_460_000.0,
            "timestamp": "2024-03-03T14:30:00Z",
        },
        {
            "txn_id": "TXN_RING_003",
            "from_entity": "Gupta Logistics",
            "to_entity": "Sharma Traders",
            "amount_inr": 4_420_000.0,
            "timestamp": "2024-03-06T16:15:00Z",
        },
        # Outside transaction
        {
            "txn_id": "TXN_OUT_001",
            "from_entity": "Sharma Traders",
            "to_entity": "BSES Rajdhani Power Ltd",
            "amount_inr": 35_000.0,
            "timestamp": "2024-03-07T11:00:00Z",
        },
    ]

    rings = detect_circular_trading_loops(transactions, max_cycle_length=5, max_slippage_pct=5.0)
    assert len(rings) >= 1

    ring = rings[0]
    assert set(ring.cycle_nodes) == {"Sharma Traders", "Verma Textiles", "Gupta Logistics"}
    assert set(ring.transaction_ids) == {"TXN_RING_001", "TXN_RING_002", "TXN_RING_003"}
    # Slippage between 45.0L and 44.2L is (45 - 44.2)/45 = 1.78% (< 5%)
    assert ring.slippage_pct < 2.5
    # Closes in ~5-6 days
    assert 5.0 <= ring.duration_days <= 6.0


def test_outside_world_dissipation_test():
    ring_entities = {"Sharma Traders", "Verma Textiles", "Gupta Logistics"}
    transactions = [
        {"from_entity": "Sharma Traders", "to_entity": "Verma Textiles", "amount_inr": 4_500_000.0},
        {"from_entity": "Gupta Logistics", "to_entity": "Sharma Traders", "amount_inr": 4_420_000.0},
        {"from_entity": "Sharma Traders", "to_entity": "BSES Power", "amount_inr": 40_000.0},
        {"from_entity": "Retail Customer A", "to_entity": "Sharma Traders", "amount_inr": 60_000.0},
    ]

    # Total volume = 4.5M + 4.42M + 40k + 60k = 9.02M
    # Outside volume = 40k + 60k = 100k
    # Outside share = 100k / 9.02M = ~1.1%
    outside_share = compute_outside_world_share("Sharma Traders", ring_entities, transactions)
    assert outside_share < 5.0  # Fails the 30% outside-world test floor
