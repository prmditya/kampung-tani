"""
Dashboard Pydantic Schemas
Response models for dashboard/overview statistics
"""

from pydantic import BaseModel, Field
from typing import List, Dict
from datetime import datetime

from app.api.v1.schemas.base import BaseSchema


class DashboardStats(BaseSchema):
    """Dashboard statistics response"""

    total_gateways: int = Field(..., description="Total number of gateways")
    active_gateways: int = Field(..., description="Number of online gateways")
    offline_gateways: int = Field(..., description="Number of offline gateways")
    maintenance_gateways: int = Field(..., description="Number of gateways in maintenance")

    total_sensors: int = Field(..., description="Total number of sensors")
    active_sensors: int = Field(..., description="Number of active sensors")

    total_farms: int = Field(..., description="Total number of farms")
    total_farmers: int = Field(..., description="Total number of farmers")

    active_assignments: int = Field(..., description="Number of active gateway assignments")

    today_readings_count: int = Field(..., description="Total sensor readings today")
    week_readings_count: int = Field(..., description="Total sensor readings this week")


class ActivityDataPoint(BaseModel):
    """Single data point for activity chart"""

    date: str = Field(..., description="Date in format 'Mon DD' (e.g., 'Oct 22')")
    readings: int = Field(..., description="Number of sensor readings on this date")


class DashboardActivity(BaseSchema):
    """Dashboard activity chart data for last 7 days"""

    data: List[ActivityDataPoint] = Field(..., description="Activity data for last 7 days")


class DashboardResponse(BaseSchema):
    """Complete dashboard response"""

    stats: DashboardStats
    activity: DashboardActivity
    generated_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp when data was generated")
