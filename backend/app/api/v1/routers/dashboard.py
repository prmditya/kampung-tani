"""
Dashboard Router
Aggregated statistics and overview data for dashboard
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.gateway import Gateway
from app.models.sensor import Sensor
from app.models.sensor_data import SensorData
from app.models.farm import Farm
from app.models.farmer import Farmer
from app.models.gateway_assignment import GatewayAssignment
from app.api.v1.schemas.dashboard import (
    DashboardResponse,
    DashboardStats,
    DashboardActivity,
    ActivityDataPoint,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/",
    response_model=DashboardResponse,
    summary="Get Dashboard Data",
    description="Get aggregated statistics and activity data for dashboard overview"
)
async def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get comprehensive dashboard data including:
    - Gateway statistics (total, active, offline, maintenance)
    - Sensor statistics (total, active)
    - Farm and farmer counts
    - Active assignments
    - Sensor reading counts (today and this week)
    - Activity chart data for last 7 days
    """

    # Get gateway stats
    gateway_query = select(
        func.count(Gateway.id).label('total'),
        func.count().filter(Gateway.status == 'online').label('active'),
        func.count().filter(Gateway.status == 'offline').label('offline'),
        func.count().filter(Gateway.status == 'maintenance').label('maintenance'),
    ).where(Gateway.user_id == current_user.id)

    gateway_result = await db.execute(gateway_query)
    gateway_stats = gateway_result.first()

    # Get sensor stats
    sensor_query = select(
        func.count(Sensor.id).label('total'),
        func.count().filter(Sensor.status == 'active').label('active'),
    ).join(Gateway).where(Gateway.user_id == current_user.id)

    sensor_result = await db.execute(sensor_query)
    sensor_stats = sensor_result.first()

    # Get farm and farmer counts
    farm_query = select(func.count(Farm.id)).join(Farmer).where(Farmer.id == Farm.farmer_id)
    farm_result = await db.execute(farm_query)
    total_farms = farm_result.scalar() or 0

    farmer_query = select(func.count(Farmer.id))
    farmer_result = await db.execute(farmer_query)
    total_farmers = farmer_result.scalar() or 0

    # Get active assignments count
    assignment_query = select(func.count(GatewayAssignment.id)).where(
        and_(
            GatewayAssignment.is_active == True,
            GatewayAssignment.gateway_id.in_(
                select(Gateway.id).where(Gateway.user_id == current_user.id)
            )
        )
    )
    assignment_result = await db.execute(assignment_query)
    active_assignments = assignment_result.scalar() or 0

    # Get today's readings count
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_query = select(func.count(SensorData.id)).where(
        and_(
            SensorData.timestamp >= today_start,
            SensorData.gateway_id.in_(
                select(Gateway.id).where(Gateway.user_id == current_user.id)
            )
        )
    )
    today_result = await db.execute(today_query)
    today_readings = today_result.scalar() or 0

    # Get this week's readings count
    week_start = datetime.utcnow() - timedelta(days=7)
    week_query = select(func.count(SensorData.id)).where(
        and_(
            SensorData.timestamp >= week_start,
            SensorData.gateway_id.in_(
                select(Gateway.id).where(Gateway.user_id == current_user.id)
            )
        )
    )
    week_result = await db.execute(week_query)
    week_readings = week_result.scalar() or 0

    # Get activity data for last 7 days
    activity_data = []
    for i in range(6, -1, -1):
        date = datetime.utcnow() - timedelta(days=i)
        date_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        date_end = date_start + timedelta(days=1)

        daily_query = select(func.count(SensorData.id)).where(
            and_(
                SensorData.timestamp >= date_start,
                SensorData.timestamp < date_end,
                SensorData.gateway_id.in_(
                    select(Gateway.id).where(Gateway.user_id == current_user.id)
                )
            )
        )
        daily_result = await db.execute(daily_query)
        daily_count = daily_result.scalar() or 0

        # Format date as "Oct 22"
        date_str = date.strftime("%b %d")

        activity_data.append(ActivityDataPoint(
            date=date_str,
            readings=daily_count
        ))

    # Build response
    stats = DashboardStats(
        total_gateways=gateway_stats.total or 0,
        active_gateways=gateway_stats.active or 0,
        offline_gateways=gateway_stats.offline or 0,
        maintenance_gateways=gateway_stats.maintenance or 0,
        total_sensors=sensor_stats.total or 0,
        active_sensors=sensor_stats.active or 0,
        total_farms=total_farms,
        total_farmers=total_farmers,
        active_assignments=active_assignments,
        today_readings_count=today_readings,
        week_readings_count=week_readings,
    )

    activity = DashboardActivity(data=activity_data)

    return DashboardResponse(
        stats=stats,
        activity=activity,
    )
