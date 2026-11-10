"""Health check endpoint."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.schemas import HealthResponse
from app.services.llm_service import get_llm_provider

logger = logging.getLogger(__name__)
router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    """Return application health status including database and LLM provider."""
    settings = get_settings()

    # Database check
    db_status = "disconnected"
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:
        logger.warning("Database health check failed: %s", exc)

    # LLM check
    provider = get_llm_provider()
    llm_provider_name = settings.LLM_PROVIDER
    try:
        llm_status = provider.health_check()
    except Exception:
        llm_status = "unavailable"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        database=db_status,
        llm_provider=f"{llm_provider_name} ({llm_status})",
        app_name=settings.APP_NAME,
    )
