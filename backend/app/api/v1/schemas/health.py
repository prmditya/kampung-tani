"""
Health Check Pydantic Schemas
System health and monitoring schemas
"""

from datetime import datetime
from typing import Dict

from app.api.v1.schemas.base import BaseSchema


class HealthResponse(BaseSchema):
    """Health check response"""

    status: str
    timestamp: datetime
    version: str
    database: bool
    services: Dict[str, bool]
