"""
Sensor Data Pydantic Schemas
Sensor readings and time-series data schemas
"""

from pydantic import Field, ConfigDict
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

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    sensor_id: int
    gateway_id: int
    timestamp: datetime

    @classmethod
    def model_validate(cls, obj, **kwargs):
        """Custom validation to handle metadata_ -> metadata mapping"""
        if hasattr(obj, 'metadata_'):
            # Create a dict copy and rename metadata_ to metadata
            obj_dict = {
                'id': obj.id,
                'sensor_id': obj.sensor_id,
                'gateway_id': obj.gateway_id,
                'value': obj.value,
                'unit': obj.unit,
                'metadata': obj.metadata_,  # Map metadata_ to metadata
                'timestamp': obj.timestamp
            }
            return super().model_validate(obj_dict, **kwargs)
        return super().model_validate(obj, **kwargs)
