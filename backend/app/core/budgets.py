"""Execution and Token Budgets for MSME Underwriting Copilot.

Prevents unbounded agent execution, excessive token expenditure, and infinite loops.
When a budget limit is reached, execution cleanly halts and hands over to a human.
"""

from __future__ import annotations

from typing import Dict, Optional
from pydantic import BaseModel, Field


class BudgetExceededError(Exception):
    """Raised when an execution or token limit is reached."""
    pass


class CaseBudget(BaseModel):
    """Budget limits and tracking counters for an individual loan case."""
    max_total_tokens: int = Field(default=50_000, description="Maximum total tokens allowed across all stages")
    max_tool_calls: int = Field(default=40, description="Maximum tool calls allowed per case")
    max_replan_iterations: int = Field(default=5, description="Maximum re-plan triggers permitted")
    max_stage_tokens: Dict[str, int] = Field(
        default_factory=lambda: {
            "intake": 10_000,
            "bureau_kyc": 5_000,
            "trust_gate": 5_000,
            "cashflow": 5_000,
            "fraud": 10_000,
            "risk": 5_000,
            "policy": 5_000,
            "structuring": 5_000,
            "cam": 12_000,
        }
    )

    # Current usage counters
    used_tokens: int = Field(default=0)
    used_tool_calls: int = Field(default=0)
    replan_count: int = Field(default=0)
    stage_tokens: Dict[str, int] = Field(default_factory=dict)

    def consume_tokens(self, stage: str, tokens: int) -> None:
        """Register token consumption and enforce limits."""
        self.used_tokens += tokens
        self.stage_tokens[stage] = self.stage_tokens.get(stage, 0) + tokens

        if self.used_tokens > self.max_total_tokens:
            raise BudgetExceededError(
                f"Case total token budget exceeded: {self.used_tokens} > {self.max_total_tokens} tokens."
            )
        
        stage_limit = self.max_stage_tokens.get(stage, 15_000)
        if self.stage_tokens[stage] > stage_limit:
            raise BudgetExceededError(
                f"Stage '{stage}' token budget exceeded: {self.stage_tokens[stage]} > {stage_limit} tokens."
            )

    def consume_tool_call(self) -> None:
        """Register a tool invocation and enforce limit."""
        self.used_tool_calls += 1
        if self.used_tool_calls > self.max_tool_calls:
            raise BudgetExceededError(
                f"Case tool call budget exceeded: {self.used_tool_calls} > {self.max_tool_calls} calls."
            )

    def register_replan(self) -> None:
        """Register a re-plan cycle and enforce limit."""
        self.replan_count += 1
        if self.replan_count > self.max_replan_iterations:
            raise BudgetExceededError(
                f"Max re-plan cycles reached: {self.replan_count} > {self.max_replan_iterations}."
            )
