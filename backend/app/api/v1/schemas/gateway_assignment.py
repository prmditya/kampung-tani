"""
Gateway Assignment Pydantic Schemas
Gateway-to-farm assignment management schemas
"""

from pydantic import Field
from typing import Optional
from datetime import datetime

from app.api.v1.schemas.base import BaseSchema


class GatewayAssignmentBase(BaseSchema):
    """Base gateway assignment schema"""

    gateway_id: int = Field(..., gt=0)
    farm_id: int = Field(..., gt=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool = True


class GatewayAssignmentCreate(BaseSchema):
    """Gateway assignment creation schema"""

    gateway_id: int = Field(..., gt=0)
    farm_id: int = Field(..., gt=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class GatewayAssignmentUpdate(BaseSchema):
    """Gateway assignment update schema - all fields optional"""

    farm_id: Optional[int] = Field(None, gt=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class GatewayAssignmentResponse(GatewayAssignmentBase):
    """Gateway assignment response schema"""

    id: int
    assigned_by: Optional[int] = None
