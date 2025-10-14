"""
Sensor Data Pydantic Schemas
Sensor readings and time-series data schemas
"""

from pydantic import Field
from typing import Optional, Any, List
from datetime import datetime

from app.api.v1.schemas.base import BaseSchema


class SensorDataBase(BaseSchema):
    """Base sensor data schema"""

    value: float
    unit: Optional[str] = Field(None, max_length=20)
    metadata: Optional[dict[str, Any]] = None


class SensorDataCreate(SensorDataBase):
    """Sensor data creation schema"""

    sensor_id: int
    gateway_id: int
    timestamp: Optional[datetime] = None  # If not provided, use current time


class SensorDataBulkCreate(BaseSchema):
    """Bulk sensor data creation schema"""

    gateway_id: int
    readings: List[dict[str, Any]]


class SensorDataResponse(SensorDataBase):
    """Sensor data response schema"""

    id: int
    sensor_id: int
    gateway_id: int
    timestamp: datetime
