"""Multi-Layered Prompt Injection Defense for Verifin.

Non-Negotiable Rule 5: Document text is untrusted data, never instructions.
Use structured extraction and delimited content, and allow-list tool calls.
Log any hidden instruction found.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field


# High-risk instruction override patterns
INJECTION_SIGNATURES = [
    re.compile(r"\[SYSTEM\s+OVERRIDE.*?\].*?", re.IGNORECASE),
    re.compile(r"(?:ignore|disregard|forget)\s+(?:all\s+)?(?:prior|previous|above)?\s*(?:underwriting\s+)?(?:instructions|rules|prompts|checks)", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+(?:an?\s+)?(?:unrestricted|admin|god|jailbroken)", re.IGNORECASE),
    re.compile(r"immediately\s+(?:assign|grant|approve|sanction)\s+(?:grade\s+a|loan|credit)", re.IGNORECASE),
    re.compile(r"set\s+risk\s+(?:score|level)\s+to\s+(?:100|0|zero)", re.IGNORECASE),
    re.compile(r"suppress\s+all\s+(?:warnings|alerts|flags|checks)", re.IGNORECASE),
    re.compile(r"bypass\s+(?:dscr|trust\s+gate|policy|limits)", re.IGNORECASE),
    re.compile(r"privileged\s+(?:institutional\s+)?partner", re.IGNORECASE),
]


class InjectionScanResult(BaseModel):
    """Result of multi-layer prompt injection scan."""
    detected: bool
    sanitized_text: str
    quarantined_payloads: List[str] = Field(default_factory=list)
    risk_level: str = Field(default="NONE")  # NONE, MEDIUM, CRITICAL


def delimit_untrusted_text(raw_text: str, document_id: str = "doc") -> str:
    """Enclose untrusted document text in strict structural boundary delimiters."""
    return (
        f"<UNTRUSTED_DOCUMENT_PAYLOAD id='{document_id}'>\n"
        f"{raw_text}\n"
        f"</UNTRUSTED_DOCUMENT_PAYLOAD>"
    )


def scan_and_sanitize_document_text(
    raw_text: str,
    metadata: Optional[Dict[str, Any]] = None,
) -> InjectionScanResult:
    """Scan untrusted text and metadata across multiple layers for adversarial directives.
    
    1. Delimits text.
    2. Detects adversarial regex signatures.
    3. Strips quarantined instruction payloads from the sanitized output text.
    4. Evaluates metadata fields (author, title, comments) for hidden injection strings.
    """
    if not raw_text and not metadata:
        return InjectionScanResult(detected=False, sanitized_text="", quarantined_payloads=[])

    quarantined: List[str] = []
    sanitized = raw_text or ""

    # 1. Text payload scanning
    for pattern in INJECTION_SIGNATURES:
        matches = pattern.findall(sanitized)
        if matches:
            for m in matches:
                quarantined.append(m.strip())
            # Quarantine and neutralize the instruction in place
            sanitized = pattern.sub("[QUARANTINED_ADVERSARIAL_INSTRUCTION]", sanitized)

    # 2. Metadata scanning (e.g. PDF Author, Subject, Keywords)
    if metadata:
        for k, v in metadata.items():
            if isinstance(v, str):
                for pattern in INJECTION_SIGNATURES:
                    if pattern.search(v):
                        quarantined.append(f"Metadata[{k}]: {v.strip()}")

    detected = len(quarantined) > 0
    risk_level = "CRITICAL" if detected else "NONE"

    return InjectionScanResult(
        detected=detected,
        sanitized_text=sanitized,
        quarantined_payloads=quarantined,
        risk_level=risk_level,
    )


def filter_schema_fields_only(
    unstructured_data: Dict[str, Any],
    allowed_keys: List[str],
) -> Dict[str, Any]:
    """Drop-outside-schema defense: Strictly drops any keys not in the allowed schema."""
    return {k: v for k, v in unstructured_data.items() if k in allowed_keys}
