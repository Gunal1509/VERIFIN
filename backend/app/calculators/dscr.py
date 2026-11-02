"""Pure deterministic DSCR (Debt Service Coverage Ratio) calculator.

Non-Negotiable Rule 1: Code computes, models explain.
DSCR arithmetic is strictly deterministic Python. Never ask a model to do arithmetic.
"""

from __future__ import annotations


def compute_dscr(
    verified_monthly_cash: float,
    total_monthly_debt_service: float,
    min_debt_floor: float = 1.0,
) -> float:
    """Calculate Debt Service Coverage Ratio (DSCR).
    
    DSCR = Verified Monthly Cash / Total Monthly Debt Service
    
    Args:
        verified_monthly_cash: Net verified monthly operating cash flow in INR.
        total_monthly_debt_service: Total monthly debt obligations (existing EMIs + proposed loan EMI).
        min_debt_floor: Safeguard against division by zero (default 1.0 INR).
        
    Returns:
        DSCR ratio rounded to 2 decimal places.
    """
    if verified_monthly_cash <= 0.0:
        return 0.0
    
    effective_debt = max(total_monthly_debt_service, min_debt_floor)
    dscr = verified_monthly_cash / effective_debt
    return round(dscr, 2)
