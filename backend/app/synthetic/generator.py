"""Master Synthetic Data Generator for MSME Underwriting Copilot.

Provides deterministic, reproducible generation of all five benchmark scenarios:
1. 'clean_file': Fully reconciled Grade A borrower.
2. 'sharma_traders': Inflated turnover gap (70%), Grade C, loan ~₹45L unlocking to ~₹66L.
3. 'linked_firm_ring': Circular trading loop (Sharma -> Verma -> Gupta -> Sharma) with shared identifiers.
4. 'honest_cash_shop': Protected Grade B retail shop, zero fraud flags.
5. 'prompt_injection_pdf': Adversarial prompt injection quarantined and logged.
"""

from __future__ import annotations

from typing import Dict, List, Callable
from backend.app.core.casefile import CaseFile
from backend.app.synthetic.scenarios import (
    create_clean_file_scenario,
    create_sharma_traders_scenario,
    add_sharma_electricity_bills_evidence,
    create_linked_firm_ring_scenario,
    create_honest_cash_shop_scenario,
    create_prompt_injection_scenario,
)

SCENARIO_REGISTRY: Dict[str, Callable[[int], CaseFile]] = {
    "clean_file": create_clean_file_scenario,
    "sharma_traders": create_sharma_traders_scenario,
    "linked_firm_ring": create_linked_firm_ring_scenario,
    "honest_cash_shop": create_honest_cash_shop_scenario,
    "prompt_injection_pdf": create_prompt_injection_scenario,
}

SCENARIO_DESCRIPTIONS: Dict[str, str] = {
    "clean_file": "Apex Auto Components: Fully reconciled GST and bank credits, Grade A, zero flags.",
    "sharma_traders": "Sharma Traders: 70% turnover gap (GST ₹4 Cr vs bank ₹1.2 Cr), Grade C, initial loan ₹45L, evidence unlocks ₹66L.",
    "linked_firm_ring": "Sharma-Verma-Gupta Ring: Circular trading directed cycle with common office address and shared contact.",
    "honest_cash_shop": "Maa Laxmi Kirana: Traditional cash-heavy grocery retail, Grade B, strictly no fraud tags, evidence ladder provided.",
    "prompt_injection_pdf": "Nexus Cloud: Adversarial prompt injection in invoice text intercepted, quarantined, and decision unaffected.",
}


def list_scenarios() -> List[Dict[str, str]]:
    """Return catalog of available demo scenarios."""
    return [
        {"name": name, "description": desc}
        for name, desc in SCENARIO_DESCRIPTIONS.items()
    ]


def generate_scenario(name: str, seed: int = 42) -> CaseFile:
    """Generate a specific scenario CaseFile deterministically by name and seed."""
    if name not in SCENARIO_REGISTRY:
        raise KeyError(
            f"Unknown scenario '{name}'. Available scenarios: {list(SCENARIO_REGISTRY.keys())}"
        )
    return SCENARIO_REGISTRY[name](seed)


def generate_all_scenarios(seed: int = 42) -> Dict[str, CaseFile]:
    """Generate all 5 scenarios at once."""
    return {name: fn(seed) for name, fn in SCENARIO_REGISTRY.items()}


def add_new_evidence_to_sharma(case: CaseFile) -> CaseFile:
    """Helper to apply new electricity bills evidence to the Sharma Traders case."""
    return add_sharma_electricity_bills_evidence(case)
