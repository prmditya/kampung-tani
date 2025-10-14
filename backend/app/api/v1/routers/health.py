"""
Health Check Router
System status and monitoring endpoints with async support
"""

from fastapi import APIRouter, status
from datetime import datetime

from app.core.config import get_settings
from app.core.database import check_database_health
from app.api.v1.schemas import HealthResponse

router = APIRouter()
settings = get_settings()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Check API and database health status",
)
async def health_check():
    """
    Comprehensive health check endpoint.

    Returns the current status of:
    - API service
    - Database connectivity
    - System timestamp
    - Version information
    """

    # Check database health
    db_healthy = await check_database_health()

    # Determine overall status
    overall_status = "healthy" if db_healthy else "unhealthy"

    return HealthResponse(
        status=overall_status,
        timestamp=datetime.utcnow(),
        version=settings.VERSION,
        database=db_healthy,
        services={
            "api": True,
            "database": db_healthy,
        },
    )


@router.get(
    "/ping",
    summary="Simple Ping",
    description="Simple ping endpoint for basic connectivity check",
)
async def ping():
    """Simple ping endpoint for quick health check"""
    return {
        "message": "pong",
        "timestamp": datetime.utcnow(),
        "version": settings.VERSION
    }
