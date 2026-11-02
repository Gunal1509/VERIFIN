"""PII Masking utility for Verifin.

Masks sensitive personal identifiable information (PAN, Aadhaar, account numbers,
phone numbers) before passing context to language models or logs.
"""

import re

# Regex patterns for Indian financial identifiers
PAN_PATTERN = re.compile(r"\b([A-Z]{5})(\d{4})([A-Z])\b")
AADHAAR_PATTERN = re.compile(r"\b(\d{4})[\s-](\d{4})[\s-](\d{4})\b")
ACCOUNT_PATTERN = re.compile(r"\b(\d{4})(\d{4,10})(\d{4})\b")
PHONE_PATTERN = re.compile(r"\b(?:\+91|91)?[\s-]?[6-9]\d{9}\b")


def mask_pii(text: str) -> str:
    """Mask PII in untrusted documents or prompt context."""
    if not text:
        return ""

    # Mask PAN: ABCDE1234F -> ABCDE****F
    masked = PAN_PATTERN.sub(r"\1****\3", text)

    # Mask Aadhaar: 1234 5678 9012 -> **** **** 9012
    masked = AADHAAR_PATTERN.sub(r"**** **** \3", masked)

    # Mask Bank Accounts: 12345678901234 -> 1234****1234
    masked = ACCOUNT_PATTERN.sub(r"\1****\3", masked)

    # Mask Indian Phone: +91 9876543210 -> +91 98****3210
    masked = PHONE_PATTERN.sub(r"+91 ******XXXX", masked)

    return masked
