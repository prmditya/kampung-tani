"""
Sensor Pydantic Schemas
Sensor device management schemas
"""

from pydantic import Field
from typing import Optional
from datetime import datetime
from enum import Enum

from app.api.v1.schemas.base import BaseSchema


class SensorStatus(str, Enum):
    """Sensor status enumeration"""

    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"


class SensorBase(BaseSchema):
    """Base sensor schema"""

    sensor_uid: str = Field(..., min_length=1, max_length=100)
    name: Optional[str] = Field(None, max_length=100)
    type: str = Field(..., max_length=50)
    status: SensorStatus = SensorStatus.INACTIVE


class SensorCreate(SensorBase):
    """Sensor creation schema"""

    gateway_id: int


class SensorUpdate(BaseSchema):
    """Sensor update schema - all fields optional"""

    name: Optional[str] = Field(None, max_length=100)
    type: Optional[str] = Field(None, max_length=50)
    status: Optional[SensorStatus] = None


class SensorResponse(SensorBase):
    """Sensor response schema"""

    id: int
    gateway_id: int
    created_at: datetime
    updated_at: datetime
