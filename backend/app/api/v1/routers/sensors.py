"""
Sensor Management Router
CRUD operations for sensors and sensor data with async SQLAlchemy
"""

from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime, timedelta
import math
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.api.v1.repositories.gateway_repository import GatewayRepository
from app.api.v1.repositories.sensor_repository import SensorRepository
from app.api.v1.repositories.sensor_data_repository import SensorDataRepository
from app.api.v1.schemas import (
    SensorCreate,
    SensorUpdate,
    SensorResponse,
    SensorDataCreate,
    SensorDataResponse,
    PaginatedResponse,
    MessageResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/",
    response_model=PaginatedResponse[SensorResponse],
    summary="Get Sensors",
    description="Get paginated list of sensors"
)
async def get_sensors(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=100, description="Items per page"),
    gateway_id: Optional[int] = Query(None, description="Filter by gateway ID"),
    sensor_type: Optional[str] = Query(None, description="Filter by sensor type"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated list of sensors.

    - **page**: Page number (default: 1)
    - **size**: Items per page (default: 50, max: 100)
    - **gateway_id**: Filter by specific gateway ID (optional)
    - **sensor_type**: Filter by sensor type (optional)
    """
    gateway_repo = GatewayRepository(db)
    sensor_repo = SensorRepository(db)

    # If gateway_id is provided, verify it belongs to the user
    if gateway_id:
        gateway = await gateway_repo.get_by_id(gateway_id)
        if not gateway or gateway.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Gateway not found"
            )

        # Get sensors for this gateway
        skip = (page - 1) * size
        sensors = await sensor_repo.get_by_gateway(
            gateway_id=gateway_id,
            skip=skip,
            limit=size,
            sensor_type=sensor_type
        )

        total = await sensor_repo.count_by_gateway(
            gateway_id=gateway_id,
            sensor_type=sensor_type
        )
    else:
        # Get all sensors for user's gateways
        # This would require a join or fetching all user gateways first
        # For simplicity, let's require gateway_id
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="gateway_id is required"
        )

    return PaginatedResponse(
        items=[SensorResponse.model_validate(sensor) for sensor in sensors],
        total=total,
        page=page,
        size=size,
        pages=math.ceil(total / size) if total > 0 else 0
    )


@router.post(
    "/",
    response_model=SensorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Sensor",
    description="Create a new sensor attached to a gateway"
)
async def create_sensor(
    sensor_data: SensorCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new sensor.

    - **gateway_id**: Gateway ID (required)
    - **sensor_uid**: Unique sensor identifier (required)
    - **name**: Sensor name (optional)
    - **type**: Sensor type (required)
    - **status**: Sensor status (default: inactive)
    """
    gateway_repo = GatewayRepository(db)
    sensor_repo = SensorRepository(db)

    # Verify gateway belongs to user
    gateway = await gateway_repo.get_by_id(sensor_data.gateway_id)
    if not gateway or gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gateway not found"
        )

    # Check if sensor UID already exists
    if await sensor_repo.sensor_uid_exists(sensor_data.sensor_uid):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sensor with UID '{sensor_data.sensor_uid}' already exists"
        )

    try:
        sensor = await sensor_repo.create(
            gateway_id=sensor_data.gateway_id,
            sensor_uid=sensor_data.sensor_uid,
            name=sensor_data.name,
            type=sensor_data.type,
            status=sensor_data.status.value
        )

        logger.info(f"Sensor created: {sensor.sensor_uid} for gateway {gateway.gateway_uid}")
        return SensorResponse.model_validate(sensor)

    except Exception as e:
        logger.error(f"Error creating sensor: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create sensor"
        )


@router.get(
    "/{sensor_id}",
    response_model=SensorResponse,
    summary="Get Sensor",
    description="Get a specific sensor by ID"
)
async def get_sensor(
    sensor_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific sensor by ID.

    Sensor's gateway must belong to the current user.
    """
    gateway_repo = GatewayRepository(db)
    sensor_repo = SensorRepository(db)

    sensor = await sensor_repo.get_by_id(sensor_id)

    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )

    # Verify gateway belongs to user
    gateway = await gateway_repo.get_by_id(sensor.gateway_id)
    if not gateway or gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )

    return SensorResponse.model_validate(sensor)


@router.put(
    "/{sensor_id}",
    response_model=SensorResponse,
    summary="Update Sensor",
    description="Update a sensor's information"
)
async def update_sensor(
    sensor_id: int,
    sensor_data: SensorUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a sensor's information.

    Only provided fields will be updated.
    Sensor's gateway must belong to the current user.
    """
    gateway_repo = GatewayRepository(db)
    sensor_repo = SensorRepository(db)

    # Check if sensor exists
    sensor = await sensor_repo.get_by_id(sensor_id)

    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )

    # Verify gateway belongs to user
    gateway = await gateway_repo.get_by_id(sensor.gateway_id)
    if not gateway or gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )

    # Prepare update data
    update_data = sensor_data.model_dump(exclude_unset=True)

    # Convert enum to string if present
    if "status" in update_data and update_data["status"]:
        update_data["status"] = update_data["status"].value

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )

    try:
        updated_sensor = await sensor_repo.update(sensor_id, **update_data)

        logger.info(f"Sensor updated: {sensor.sensor_uid}")
        return SensorResponse.model_validate(updated_sensor)

    except Exception as e:
        logger.error(f"Error updating sensor: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update sensor"
        )


@router.delete(
    "/{sensor_id}",
    response_model=MessageResponse,
    summary="Delete Sensor",
    description="Delete a sensor and all its data"
)
async def delete_sensor(
    sensor_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a sensor and all its associated sensor data.

    Sensor's gateway must belong to the current user.
    This action cannot be undone.
    """
    gateway_repo = GatewayRepository(db)
    sensor_repo = SensorRepository(db)

    # Check if sensor exists
    sensor = await sensor_repo.get_by_id(sensor_id)

    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )

    # Verify gateway belongs to user
    gateway = await gateway_repo.get_by_id(sensor.gateway_id)
    if not gateway or gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )

    sensor_uid = sensor.sensor_uid

    try:
        # Delete sensor (cascade will handle sensor_data)
        await sensor_repo.delete(sensor_id)

        logger.info(f"Sensor deleted: {sensor_uid}")

        return MessageResponse(
            message=f"Sensor '{sensor_uid}' deleted successfully"
        )

    except Exception as e:
        logger.error(f"Error deleting sensor: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete sensor"
        )


# Sensor Data Endpoints

@router.get(
    "/{sensor_id}/data",
    response_model=PaginatedResponse[SensorDataResponse],
    summary="Get Sensor Data",
    description="Get sensor readings for a specific sensor"
)
async def get_sensor_data(
    sensor_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=1000, description="Items per page"),
    hours: Optional[int] = Query(None, ge=1, le=8760, description="Last N hours of data"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get sensor data for a specific sensor.

    - **sensor_id**: Sensor ID (required)
    - **page**: Page number (default: 1)
    - **size**: Items per page (default: 50, max: 1000)
    - **hours**: Get data from last N hours (optional, max: 8760 = 1 year)
    """
    gateway_repo = GatewayRepository(db)
    sensor_repo = SensorRepository(db)
    sensor_data_repo = SensorDataRepository(db)

    # Check if sensor exists
    sensor = await sensor_repo.get_by_id(sensor_id)

    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )

    # Verify gateway belongs to user
    gateway = await gateway_repo.get_by_id(sensor.gateway_id)
    if not gateway or gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )

    # Calculate date filters
    start_date = None
    if hours:
        start_date = datetime.utcnow() - timedelta(hours=hours)

    # Get paginated sensor data
    skip = (page - 1) * size
    sensor_data_list = await sensor_data_repo.get_by_sensor(
        sensor_id=sensor_id,
        skip=skip,
        limit=size,
        start_date=start_date
    )

    total = await sensor_data_repo.count_by_sensor(
        sensor_id=sensor_id,
        start_date=start_date
    )

    return PaginatedResponse(
        items=[SensorDataResponse.model_validate(data) for data in sensor_data_list],
        total=total,
        page=page,
        size=size,
        pages=math.ceil(total / size) if total > 0 else 0
    )


@router.post(
    "/{sensor_id}/data",
    response_model=SensorDataResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Sensor Data",
    description="Add new sensor data point"
)
async def create_sensor_data(
    sensor_id: int,
    data: SensorDataCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add a new sensor data point.

    Sensor and gateway must belong to the current user.

    - **sensor_id**: Sensor ID (required)
    - **value**: Sensor reading value (required)
    - **unit**: Unit of measurement (optional)
    - **metadata**: Additional metadata as JSON (optional)
    - **timestamp**: Timestamp (optional, defaults to current time)
    """
    gateway_repo = GatewayRepository(db)
    sensor_repo = SensorRepository(db)
    sensor_data_repo = SensorDataRepository(db)

    # Verify sensor exists
    sensor = await sensor_repo.get_by_id(sensor_id)
    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )

    # Verify gateway belongs to user
    gateway = await gateway_repo.get_by_id(sensor.gateway_id)
    if not gateway or gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )

    # Verify gateway_id matches if provided in data
    if data.gateway_id != sensor.gateway_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gateway ID mismatch"
        )

    try:
        sensor_data_entry = await sensor_data_repo.create(
            sensor_id=sensor_id,
            gateway_id=data.gateway_id,
            value=data.value,
            unit=data.unit,
            metadata=data.metadata,
            timestamp=data.timestamp or datetime.utcnow()
        )

        return SensorDataResponse.model_validate(sensor_data_entry)

    except Exception as e:
        logger.error(f"Error creating sensor data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create sensor data"
        )


@router.get(
    "/{sensor_id}/stats",
    summary="Get Sensor Statistics",
    description="Get statistical summary of sensor data"
)
async def get_sensor_stats(
    sensor_id: int,
    hours: int = Query(24, ge=1, le=8760, description="Hours to analyze (default: 24)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get statistical summary of sensor data.

    - **sensor_id**: Sensor ID (required)
    - **hours**: Hours to analyze (default: 24, max: 8760)

    Returns min, max, average, and count of sensor readings.
    """
    gateway_repo = GatewayRepository(db)
    sensor_repo = SensorRepository(db)
    sensor_data_repo = SensorDataRepository(db)

    # Check if sensor exists
    sensor = await sensor_repo.get_by_id(sensor_id)

    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )

    # Verify gateway belongs to user
    gateway = await gateway_repo.get_by_id(sensor.gateway_id)
    if not gateway or gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )

    # Get statistics
    stats = await sensor_data_repo.get_statistics_by_sensor(
        sensor_id=sensor_id,
        hours=hours
    )

    return {
        "sensor_id": sensor_id,
        "sensor_uid": sensor.sensor_uid,
        "sensor_type": sensor.type,
        "period_hours": hours,
        "statistics": stats
    }
