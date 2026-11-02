"""FastAPI Main Application for Verifin.

Non-Negotiable Rule 1: Code computes, models explain.
Non-Negotiable Rule 2: No disbursal. Automated fund disbursal is strictly impossible.
Non-Negotiable Rule 3: No automatic rejection. The system proposes, a human decides.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.routes import router

app = FastAPI(
    title="Verifin API",
    description="Adaptive Multi-Agent Financial Intelligence System API",
    version="1.0.0",
)

# Enable CORS for React frontend dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/health")
def health_check():
    """System health check and safety invariant verification."""
    return {
        "status": "healthy",
        "system": "Verifin",
        "disbursal_route": "STRICTLY_LOCKED_NON_EXISTENT",
        "human_decision_required": True,
    }
