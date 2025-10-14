"""
Farmer Pydantic Schemas
Farm owner management schemas
"""

from pydantic import Field
from typing import Optional
from datetime import datetime

from app.api.v1.schemas.base import BaseSchema


class FarmerBase(BaseSchema):
    """Base farmer schema"""

    name: str = Field(..., min_length=1, max_length=100)
    contact: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = Field(None, max_length=1000)


class FarmerCreate(FarmerBase):
    """Farmer creation schema"""

    pass


class FarmerUpdate(BaseSchema):
    """Farmer update schema - all fields optional"""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    contact: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = Field(None, max_length=1000)


class FarmerResponse(FarmerBase):
    """Farmer response schema"""

    id: int
    created_at: datetime
