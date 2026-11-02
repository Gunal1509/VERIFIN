"""Pure deterministic Present Value loan sizing calculator.

Calculates safe loan sizing derived strictly from verified operating cash,
policy-mandated DSCR coverage floor, and standard annuity Present Value formulas.
"""

from __future__ import annotations

from typing import Dict, Any
from pydantic import BaseModel, Field


class LoanSizingResult(BaseModel):
    """Output from deterministic cashflow loan sizing."""
    verified_monthly_cash_inr: float = Field(ge=0.0)
    existing_monthly_emi_inr: float = Field(ge=0.0)
    min_dscr_target: float = Field(gt=0.0)
    max_total_emi_capacity_inr: float = Field(ge=0.0)
    available_new_emi_capacity_inr: float = Field(ge=0.0)
    annual_interest_rate_pct: float = Field(ge=0.0)
    tenor_months: int = Field(ge=1)
    present_value_raw_inr: float = Field(ge=0.0)
    recommended_loan_amount_inr: float = Field(ge=0.0)
    dscr_at_recommended: float = Field(ge=0.0)


def calculate_annuity_present_value(
    monthly_emi: float,
    annual_interest_rate_pct: float,
    tenor_months: int,
) -> float:
    """Calculate the Present Value (principal) of an ordinary annuity.
    
    Formula: PV = PMT * [1 - (1 + r)^(-n)] / r
    where:
        r = monthly interest rate = (annual_interest_rate_pct / 100) / 12
        n = tenor in months
    """
    if monthly_emi <= 0.0 or tenor_months <= 0:
        return 0.0
    
    if annual_interest_rate_pct <= 0.0:
        return monthly_emi * tenor_months
    
    r = (annual_interest_rate_pct / 100.0) / 12.0
    pv = monthly_emi * (1.0 - (1.0 + r) ** (-tenor_months)) / r
    return pv


def size_loan_from_cashflow(
    verified_monthly_cash_inr: float,
    existing_monthly_emi_inr: float = 0.0,
    min_dscr_target: float = 1.25,
    annual_interest_rate_pct: float = 12.0,
    tenor_months: int = 60,
    round_to_nearest_lakh: bool = True,
) -> LoanSizingResult:
    """Deterministically size an MSME term loan from verified cashflow.
    
    Step 1: Compute maximum allowable monthly debt capacity:
            Max Total EMI = Verified Monthly Cash / Min DSCR Target
    Step 2: Subtract existing obligations to get available headroom:
            Available New EMI = max(0, Max Total EMI - Existing EMI)
    Step 3: Present Value of Available New EMI gives loan capacity.
    """
    if verified_monthly_cash_inr <= 0.0:
        max_total_emi = 0.0
        available_new_emi = 0.0
    else:
        max_total_emi = verified_monthly_cash_inr / min_dscr_target
        available_new_emi = max(0.0, max_total_emi - existing_monthly_emi_inr)
    
    pv_raw = calculate_annuity_present_value(
        monthly_emi=available_new_emi,
        annual_interest_rate_pct=annual_interest_rate_pct,
        tenor_months=tenor_months,
    )
    
    if round_to_nearest_lakh:
        # Standard banking convention: round to nearest INR 50,000 or 1,00,000
        recommended_loan = round(pv_raw / 100_000.0) * 100_000.0
    else:
        recommended_loan = round(pv_raw, 2)
    
    # Calculate resulting DSCR
    total_debt = existing_monthly_emi_inr + available_new_emi
    effective_dscr = round(verified_monthly_cash_inr / max(1.0, total_debt), 2)
    
    return LoanSizingResult(
        verified_monthly_cash_inr=verified_monthly_cash_inr,
        existing_monthly_emi_inr=existing_monthly_emi_inr,
        min_dscr_target=min_dscr_target,
        max_total_emi_capacity_inr=round(max_total_emi, 2),
        available_new_emi_capacity_inr=round(available_new_emi, 2),
        annual_interest_rate_pct=annual_interest_rate_pct,
        tenor_months=tenor_months,
        present_value_raw_inr=round(pv_raw, 2),
        recommended_loan_amount_inr=recommended_loan,
        dscr_at_recommended=effective_dscr,
    )
