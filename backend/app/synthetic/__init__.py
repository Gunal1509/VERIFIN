"""Synthetic data generator package for Verifin: An Adaptive Multi-Agent Financial Intelligence System."""

from backend.app.synthetic.generator import (
    generate_scenario,
    generate_all_scenarios,
    list_scenarios,
    add_new_evidence_to_sharma,
    SCENARIO_REGISTRY,
    SCENARIO_DESCRIPTIONS,
)

__all__ = [
    "generate_scenario",
    "generate_all_scenarios",
    "list_scenarios",
    "add_new_evidence_to_sharma",
    "SCENARIO_REGISTRY",
    "SCENARIO_DESCRIPTIONS",
]
