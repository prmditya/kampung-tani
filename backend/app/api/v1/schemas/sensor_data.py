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


# Nested schemas for relationships
class FarmMinimal(BaseSchema):
    """Minimal farm info for sensor data response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    location: Optional[str] = None
    farmer_id: int  # Include farmer_id so frontend can lookup farmer


class UserMinimal(BaseSchema):
    """Minimal user info for sensor data response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    username: str


class SensorDataResponse(SensorDataBase):
    """Sensor data response schema"""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    sensor_id: int
    gateway_id: int
    timestamp: datetime
    
    # Historical assignment snapshot
    farm_id: Optional[int] = None
    assigned_by: Optional[int] = None
    
    # Nested relationships (optional, only loaded if explicitly queried)
    farm: Optional[FarmMinimal] = None
    assigned_by_user: Optional[UserMinimal] = None

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
                'timestamp': obj.timestamp,
                'farm_id': getattr(obj, 'farm_id', None),
                'assigned_by': getattr(obj, 'assigned_by', None),
                'farm': getattr(obj, 'farm', None),
                'assigned_by_user': getattr(obj, 'assigned_by_user', None),
            }
            return super().model_validate(obj_dict, **kwargs)
        return super().model_validate(obj, **kwargs)
