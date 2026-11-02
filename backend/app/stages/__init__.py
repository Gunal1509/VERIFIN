"""Stages package for Verifin: An Adaptive Multi-Agent Financial Intelligence System."""

from typing import List
from backend.app.stages.base import Stage, StageResult, RunContext, BaseStage
from backend.app.stages.intake import IntakeStage
from backend.app.stages.bureau_kyc import BureauKYCStage
from backend.app.stages.trust_gate import TrustGateStage
from backend.app.stages.cashflow import CashflowStage
from backend.app.stages.fraud import FraudStage
from backend.app.stages.risk import RiskStage
from backend.app.stages.policy import PolicyStage
from backend.app.stages.structuring import StructuringStage
from backend.app.stages.cam import CAMStage
from backend.app.stages.ledger import LedgerStage
from backend.app.stages.human import HumanDecisionStage


def get_all_standard_stages() -> List[Stage]:
    """Return an instantiated list of all 11 standard underwriting stages."""
    return [
        IntakeStage(),
        BureauKYCStage(),
        TrustGateStage(),
        CashflowStage(),
        FraudStage(),
        RiskStage(),
        PolicyStage(),
        StructuringStage(),
        CAMStage(),
        LedgerStage(),
        HumanDecisionStage(),
    ]


__all__ = [
    "Stage",
    "StageResult",
    "RunContext",
    "BaseStage",
    "IntakeStage",
    "BureauKYCStage",
    "TrustGateStage",
    "CashflowStage",
    "FraudStage",
    "RiskStage",
    "PolicyStage",
    "StructuringStage",
    "CAMStage",
    "LedgerStage",
    "HumanDecisionStage",
    "get_all_standard_stages",
]
