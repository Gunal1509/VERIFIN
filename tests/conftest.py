"""Pytest configuration and shared fixtures for MSME Underwriting Copilot."""

import sys
from pathlib import Path
import pytest

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


@pytest.fixture
def clean_case():
    from backend.app.synthetic.generator import generate_scenario
    return generate_scenario("clean_file", seed=42)


@pytest.fixture
def sharma_case():
    from backend.app.synthetic.generator import generate_scenario
    return generate_scenario("sharma_traders", seed=42)


@pytest.fixture
def ring_case():
    from backend.app.synthetic.generator import generate_scenario
    return generate_scenario("linked_firm_ring", seed=42)


@pytest.fixture
def cash_shop_case():
    from backend.app.synthetic.generator import generate_scenario
    return generate_scenario("honest_cash_shop", seed=42)


@pytest.fixture
def injection_case():
    from backend.app.synthetic.generator import generate_scenario
    return generate_scenario("prompt_injection_pdf", seed=42)
