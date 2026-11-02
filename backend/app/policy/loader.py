"""Policy Pack Loader for Verifin.

Loads bank underwriting policy guidelines from YAML into typed Pydantic models.
"""

from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Optional
import yaml
from pydantic import BaseModel, Field

DEFAULT_POLICY_DIR = Path(__file__).resolve().parent.parent / "policy_packs"


class PolicyLimits(BaseModel):
    """Underwriting threshold limits defined in a policy pack."""
    min_dscr: float = Field(default=1.25)
    max_turnover_gap_pct: float = Field(default=20.0)
    max_loan_amount_inr: float = Field(default=10_000_000.0)
    min_loan_amount_inr: float = Field(default=500_000.0)
    min_bureau_score: int = Field(default=650)
    max_unbanked_cash_share_pct: float = Field(default=75.0)
    max_tenor_months: int = Field(default=84)
    standard_interest_rate_pct: float = Field(default=12.0)
    max_cycle_slippage_pct: float = Field(default=5.0)
    min_outside_world_share_pct: float = Field(default=30.0)


class PolicyPack(BaseModel):
    """Complete bank underwriting policy configuration."""
    name: str
    description: str = Field(default="")
    version: str = Field(default="1.0.0")
    limits: PolicyLimits = Field(default_factory=PolicyLimits)
    sector_exclusions: List[str] = Field(default_factory=list)


_POLICY_CACHE: Dict[str, PolicyPack] = {}


def load_policy_pack(policy_name: str, policy_dir: Optional[Path] = None) -> PolicyPack:
    """Load a policy pack by name (e.g. 'bank_a', 'bank_b')."""
    policy_key = policy_name.lower().replace(".yaml", "")
    if policy_key in _POLICY_CACHE:
        return _POLICY_CACHE[policy_key]

    dir_to_use = policy_dir or DEFAULT_POLICY_DIR
    file_path = dir_to_use / f"{policy_key}.yaml"
    if not file_path.exists():
        raise FileNotFoundError(f"Policy pack '{policy_key}' not found at {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    pack = PolicyPack.model_validate(data)
    _POLICY_CACHE[policy_key] = pack
    return pack


def list_available_policy_packs(policy_dir: Optional[Path] = None) -> List[str]:
    """Return available policy pack names in the policy directory."""
    dir_to_use = policy_dir or DEFAULT_POLICY_DIR
    if not dir_to_use.exists():
        return []
    return [p.stem for p in dir_to_use.glob("*.yaml")]
