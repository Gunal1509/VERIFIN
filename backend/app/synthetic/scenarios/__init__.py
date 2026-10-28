"""Synthetic test scenarios for MSME Underwriting Copilot."""

from backend.app.synthetic.scenarios.clean_file import create_clean_file_scenario
from backend.app.synthetic.scenarios.sharma_traders import (
    create_sharma_traders_scenario,
    add_sharma_electricity_bills_evidence,
)
from backend.app.synthetic.scenarios.linked_firm_ring import create_linked_firm_ring_scenario
from backend.app.synthetic.scenarios.honest_cash_shop import create_honest_cash_shop_scenario
from backend.app.synthetic.scenarios.prompt_injection_pdf import create_prompt_injection_scenario

__all__ = [
    "create_clean_file_scenario",
    "create_sharma_traders_scenario",
    "add_sharma_electricity_bills_evidence",
    "create_linked_firm_ring_scenario",
    "create_honest_cash_shop_scenario",
    "create_prompt_injection_scenario",
]
