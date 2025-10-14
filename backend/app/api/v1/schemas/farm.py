"""
Farm Pydantic Schemas
Agricultural farm management schemas
"""

from pydantic import Field
from typing import Optional
from datetime import datetime

from app.api.v1.schemas.base import BaseSchema


class FarmBase(BaseSchema):
    """Base farm schema"""

    farmer_id: int = Field(..., gt=0)
    name: str = Field(..., min_length=1, max_length=100)
    location: Optional[str] = Field(None, max_length=200)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    area_size: Optional[float] = Field(None, gt=0, description="Area size in hectares")
    soil_type: Optional[str] = Field(None, max_length=50)


class FarmCreate(FarmBase):
    """Farm creation schema"""

    pass


class FarmUpdate(BaseSchema):
    """Farm update schema - all fields optional"""

    farmer_id: Optional[int] = Field(None, gt=0)
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = Field(None, max_length=200)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    area_size: Optional[float] = Field(None, gt=0)
    soil_type: Optional[str] = Field(None, max_length=50)


class FarmResponse(FarmBase):
    """Farm response schema"""

    id: int
    created_at: datetime
    updated_at: datetime
