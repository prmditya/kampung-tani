"""
Gateway Pydantic Schemas
Gateway device management schemas
"""

from pydantic import Field
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from enum import Enum

from app.api.v1.schemas.base import BaseSchema

if TYPE_CHECKING:
    from app.api.v1.schemas.sensor import SensorResponse


class GatewayStatus(str, Enum):
    """Gateway status enumeration"""

    ONLINE = "online"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"


class GatewayBase(BaseSchema):
    """Base gateway schema"""

    gateway_uid: str = Field(..., min_length=1, max_length=100)
    name: Optional[str] = Field(None, max_length=100)
    mac_address: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = Field(None, max_length=1000)
    status: GatewayStatus = GatewayStatus.OFFLINE


class GatewayCreate(GatewayBase):
    """Gateway creation schema"""

    pass


class GatewayUpdate(BaseSchema):
    """Gateway update schema - all fields optional"""

    name: Optional[str] = Field(None, max_length=100)
    mac_address: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[GatewayStatus] = None


class GatewayResponse(GatewayBase):
    """Gateway response schema"""

    id: int
    user_id: int
    last_seen: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


# class GatewayWithSensors(GatewayResponse):
    """Gateway response with sensors included"""

#     sensors: List["SensorResponse"] = []
