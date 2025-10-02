"""
Sensor Data Router
Sensor data collection and retrieval endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import math

from app.core.database import get_db_cursor
from app.core.security import get_current_user
from app.schemas import (
    SensorDataCreate,
    SensorDataResponse,
    PaginatedResponse,
    MessageResponse
)

router = APIRouter()


@router.get(
    "/",
    response_model=PaginatedResponse,
    summary="Get Sensor Data",
    description="Get paginated sensor data with filtering options"
)
async def get_sensor_data(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=1000, description="Items per page"),
    device_id: Optional[int] = Query(None, description="Filter by device ID"),
    sensor_type: Optional[str] = Query(None, description="Filter by sensor type"),
    start_date: Optional[datetime] = Query(None, description="Start date filter (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="End date filter (ISO format)"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get paginated sensor data with various filtering options.
    
    - **page**: Page number (default: 1)
    - **size**: Items per page (default: 50, max: 1000)
    - **device_id**: Filter by specific device ID (optional)
    - **sensor_type**: Filter by sensor type (optional)
    - **start_date**: Start date filter in ISO format (optional)
    - **end_date**: End date filter in ISO format (optional)
    
    Only returns data from devices belonging to the current user.
    """
    
    with get_db_cursor() as cursor:
        # Build WHERE clause for user's devices
        where_conditions = ["d.user_id = %s"]
        params = [current_user["id"]]
        
        if device_id:
            where_conditions.append("sd.device_id = %s")
            params.append(device_id)
        
        if sensor_type:
            where_conditions.append("sd.sensor_type = %s")
            params.append(sensor_type)
        
        if start_date:
            where_conditions.append("sd.timestamp >= %s")
            params.append(start_date)
        
        if end_date:
            where_conditions.append("sd.timestamp <= %s")
            params.append(end_date)
        
        where_clause = " AND ".join(where_conditions)
        
        # Get total count
        cursor.execute(
            f"""
            SELECT COUNT(*) 
            FROM sensor_data sd
            JOIN devices d ON sd.device_id = d.id
            WHERE {where_clause}
            """,
            params
        )
        total = cursor.fetchone()["count"]
        
        # Get paginated sensor data
        offset = (page - 1) * size
        cursor.execute(
            f"""
            SELECT sd.id, sd.device_id, sd.sensor_type, sd.value, sd.unit, sd.metadata, sd.timestamp
            FROM sensor_data sd
            JOIN devices d ON sd.device_id = d.id
            WHERE {where_clause}
            ORDER BY sd.timestamp DESC
            LIMIT %s OFFSET %s
            """,
            params + [size, offset]
        )
        
        sensor_data = cursor.fetchall()
        
        return PaginatedResponse(
            items=[SensorDataResponse(**dict(data)) for data in sensor_data],
            total=total,
            page=page,
            size=size,
            pages=math.ceil(total / size)
        )


@router.post(
    "/",
    response_model=SensorDataResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Sensor Data",
    description="Add new sensor data point"
)
async def create_sensor_data(
    sensor_data: SensorDataCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Add a new sensor data point.
    
    Device must belong to the current user.
    
    - **device_id**: ID of the device (required)
    - **sensor_type**: Type of sensor (required)
    - **value**: Sensor reading value (required)
    - **unit**: Unit of measurement (optional)
    - **metadata**: Additional metadata as JSON (optional)
    """
    
    with get_db_cursor() as cursor:
        # Verify device belongs to user
        cursor.execute(
            "SELECT id FROM devices WHERE id = %s AND user_id = %s",
            (sensor_data.device_id, current_user["id"])
        )
        
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found or does not belong to user"
            )
        
        # Insert sensor data
        cursor.execute(
            """
            INSERT INTO sensor_data (device_id, sensor_type, value, unit, metadata, timestamp)
            VALUES (%s, %s, %s, %s, %s, NOW())
            RETURNING id, device_id, sensor_type, value, unit, metadata, timestamp
            """,
            (
                sensor_data.device_id,
                sensor_data.sensor_type,
                sensor_data.value,
                sensor_data.unit,
                sensor_data.metadata
            )
        )
        
        data = cursor.fetchone()
        return SensorDataResponse(**dict(data))


@router.get(
    "/device/{device_id}",
    response_model=PaginatedResponse,
    summary="Get Device Sensor Data",
    description="Get sensor data for a specific device"
)
async def get_device_sensor_data(
    device_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=1000, description="Items per page"),
    sensor_type: Optional[str] = Query(None, description="Filter by sensor type"),
    hours: Optional[int] = Query(None, ge=1, le=8760, description="Last N hours of data"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get sensor data for a specific device.
    
    - **device_id**: Device ID (required)
    - **page**: Page number (default: 1)
    - **size**: Items per page (default: 50, max: 1000)
    - **sensor_type**: Filter by sensor type (optional)
    - **hours**: Get data from last N hours (optional, max: 8760 = 1 year)
    """
    
    with get_db_cursor() as cursor:
        # Verify device belongs to user
        cursor.execute(
            "SELECT id FROM devices WHERE id = %s AND user_id = %s",
            (device_id, current_user["id"])
        )
        
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )
        
        # Build WHERE clause
        where_conditions = ["device_id = %s"]
        params = [device_id]
        
        if sensor_type:
            where_conditions.append("sensor_type = %s")
            params.append(sensor_type)
        
        if hours:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            where_conditions.append("timestamp >= %s")
            params.append(cutoff_time)
        
        where_clause = " AND ".join(where_conditions)
        
        # Get total count
        cursor.execute(
            f"SELECT COUNT(*) FROM sensor_data WHERE {where_clause}",
            params
        )
        total = cursor.fetchone()["count"]
        
        # Get paginated sensor data
        offset = (page - 1) * size
        cursor.execute(
            f"""
            SELECT id, device_id, sensor_type, value, unit, metadata, timestamp
            FROM sensor_data 
            WHERE {where_clause}
            ORDER BY timestamp DESC
            LIMIT %s OFFSET %s
            """,
            params + [size, offset]
        )
        
        sensor_data = cursor.fetchall()
        
        return PaginatedResponse(
            items=[SensorDataResponse(**dict(data)) for data in sensor_data],
            total=total,
            page=page,
            size=size,
            pages=math.ceil(total / size)
        )


@router.get(
    "/stats/{device_id}",
    summary="Get Device Statistics",
    description="Get statistical summary of sensor data for a device"
)
async def get_device_stats(
    device_id: int,
    sensor_type: Optional[str] = Query(None, description="Filter by sensor type"),
    hours: int = Query(24, ge=1, le=8760, description="Hours to analyze (default: 24)"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get statistical summary of sensor data for a device.
    
    - **device_id**: Device ID (required)
    - **sensor_type**: Filter by sensor type (optional)
    - **hours**: Hours to analyze (default: 24, max: 8760)
    
    Returns min, max, average, and count of sensor readings.
    """
    
    with get_db_cursor() as cursor:
        # Verify device belongs to user
        cursor.execute(
            "SELECT name FROM devices WHERE id = %s AND user_id = %s",
            (device_id, current_user["id"])
        )
        
        device = cursor.fetchone()
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )
        
        # Build WHERE clause
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        where_conditions = ["device_id = %s", "timestamp >= %s"]
        params = [device_id, cutoff_time]
        
        if sensor_type:
            where_conditions.append("sensor_type = %s")
            params.append(sensor_type)
        
        where_clause = " AND ".join(where_conditions)
        
        # Get statistics
        cursor.execute(
            f"""
            SELECT 
                sensor_type,
                COUNT(*) as count,
                MIN(value) as min_value,
                MAX(value) as max_value,
                AVG(value) as avg_value,
                MIN(timestamp) as first_reading,
                MAX(timestamp) as last_reading
            FROM sensor_data 
            WHERE {where_clause}
            GROUP BY sensor_type
            ORDER BY sensor_type
            """,
            params
        )
        
        stats = cursor.fetchall()
        
        return {
            "device_id": device_id,
            "device_name": device["name"],
            "period_hours": hours,
            "statistics": [dict(stat) for stat in stats]
        }


@router.delete(
    "/device/{device_id}",
    response_model=MessageResponse,
    summary="Delete Device Sensor Data",
    description="Delete all sensor data for a device"
)
async def delete_device_sensor_data(
    device_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Delete all sensor data for a specific device.
    
    Device must belong to the current user.
    This action cannot be undone.
    """
    
    with get_db_cursor() as cursor:
        # Verify device belongs to user
        cursor.execute(
            "SELECT name FROM devices WHERE id = %s AND user_id = %s",
            (device_id, current_user["id"])
        )
        
        device = cursor.fetchone()
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )
        
        # Delete sensor data
        cursor.execute(
            "DELETE FROM sensor_data WHERE device_id = %s",
            (device_id,)
        )
        
        return MessageResponse(
            message=f"All sensor data for device '{device['name']}' deleted successfully"
        )