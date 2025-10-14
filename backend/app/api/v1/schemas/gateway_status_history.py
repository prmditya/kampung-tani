"""
Gateway Status History Pydantic Schemas
Gateway status tracking and history schemas
"""

from pydantic import Field
from typing import Optional
from datetime import datetime

from app.api.v1.schemas.base import BaseSchema
from app.api.v1.schemas.gateway import GatewayStatus


class GatewayStatusHistoryBase(BaseSchema):
    """Base gateway status history schema"""

    gateway_id: int = Field(..., gt=0)
    status: str = Field(..., min_length=1, max_length=20)
    uptime_seconds: Optional[int] = Field(None, ge=0)


class GatewayStatusHistoryCreate(BaseSchema):
    """Gateway status history creation schema"""

    gateway_id: int = Field(..., gt=0)
    status: str = Field(..., min_length=1, max_length=20)
    uptime_seconds: Optional[int] = Field(None, ge=0)


class GatewayStatusHistoryResponse(GatewayStatusHistoryBase):
    """Gateway status history response schema"""

    id: int
    created_at: datetime
