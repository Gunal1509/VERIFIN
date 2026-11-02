"""Model Layer: Provider interface, offline mock provider, task-based router, and cache.

Allows full local offline execution with zero API keys or external dependencies.
"""

from __future__ import annotations

import hashlib
import time
from typing import Dict, Optional, Protocol, runtime_checkable
from pydantic import BaseModel, Field


class LLMResponse(BaseModel):
    """Normalized response produced by an LLM provider."""
    content: str
    prompt_tokens: int = Field(default=0)
    completion_tokens: int = Field(default=0)
    total_tokens: int = Field(default=0)
    latency_ms: float = Field(default=0.0)
    cached: bool = Field(default=False)


@runtime_checkable
class LLMProvider(Protocol):
    """Interface for language model providers."""
    async def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        task: str = "general",
    ) -> LLMResponse:
        ...


class OfflineMockProvider:
    """Deterministic offline mock provider requiring no external API key."""

    def __init__(self) -> None:
        self._cache: Dict[str, LLMResponse] = {}

    def _compute_cache_key(self, prompt: str, system_prompt: str, task: str) -> str:
        raw = f"{task}:{system_prompt}:{prompt}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    async def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        task: str = "general",
    ) -> LLMResponse:
        cache_key = self._compute_cache_key(prompt, system_prompt, task)
        if cache_key in self._cache:
            hit = self._cache[cache_key]
            return hit.model_copy(update={"cached": True, "latency_ms": 0.5})

        start_time = time.perf_counter()

        # Deterministic generation based on task
        if "cam" in task.lower():
            content = (
                "Executive Summary: Financial appraisal conducted across 12-month GSTR-3B filings "
                "and operating bank statements. Revenue triangulation established through the Trust Gate. "
                "Loan limit sized deterministically to guarantee compliance with mandatory DSCR floors."
            )
        elif "intake" in task.lower():
            content = "Document Intake Summary: Extracted tax turnover and primary bank credit inflows."
        elif "challenge" in task.lower():
            content = "Flag Challenge: Circular trading ring confirmed via NetworkX directed cycle analysis."
        else:
            content = "Analytical assessment generated successfully."

        latency_ms = (time.perf_counter() - start_time) * 1000.0 + 15.0
        prompt_tokens = max(10, len(prompt.split()) * 2)
        completion_tokens = max(10, len(content.split()) * 2)
        total_tokens = prompt_tokens + completion_tokens

        resp = LLMResponse(
            content=content,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            latency_ms=round(latency_ms, 2),
            cached=False,
        )
        self._cache[cache_key] = resp
        return resp


class ModelRouter:
    """Routes tasks to configured model providers with token caps."""

    def __init__(self, default_provider: Optional[LLMProvider] = None) -> None:
        self.default_provider = default_provider or OfflineMockProvider()
        self.token_caps: Dict[str, int] = {
            "intake": 10_000,
            "cam": 12_000,
            "challenge": 8_000,
        }

    async def complete(
        self,
        prompt: str,
        system_prompt: str = "",
        task: str = "general",
    ) -> LLMResponse:
        return await self.default_provider.generate(prompt, system_prompt, task)
