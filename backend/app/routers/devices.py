"""
Device Management Router
CRUD operations for IoT devices
"""

from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import Dict, Any, List, Optional
import math

from app.core.database import get_db_cursor
from app.core.security import get_current_user
from app.services.device_status_service import DeviceStatusService
from app.schemas import (
    DeviceCreate,
    DeviceUpdate,
    DeviceResponse,
    PaginatedResponse,
    MessageResponse,
    PaginationParams
)

router = APIRouter()


@router.get(
    "/",
    response_model=PaginatedResponse,
    summary="Get User Devices",
    description="Get paginated list of devices for current user"
)
async def get_user_devices(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search devices by name"),
    status: Optional[str] = Query(None, description="Filter by device status"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get paginated list of devices for the current user.
    
    - **page**: Page number (default: 1)
    - **size**: Items per page (default: 20, max: 100)
    - **search**: Search devices by name (optional)
    - **status**: Filter by device status (optional)
    """
    
    with get_db_cursor() as cursor:
        # Build WHERE clause
        where_conditions = ["user_id = %s"]
        params = [current_user["id"]]
        
        if search:
            where_conditions.append("name ILIKE %s")
            params.append(f"%{search}%")
        
        if status:
            where_conditions.append("status = %s")
            params.append(status)
        
        where_clause = " AND ".join(where_conditions)
        
        # Get total count
        cursor.execute(
            f"SELECT COUNT(*) FROM devices WHERE {where_clause}",
            params
        )
        total = cursor.fetchone()["count"]
        
        # Get paginated devices
        offset = (page - 1) * size
        cursor.execute(
            f"""
            SELECT id, name, description, location, device_type, status, user_id, created_at, updated_at
            FROM devices 
            WHERE {where_clause}
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
            """,
            params + [size, offset]
        )
        
        devices = cursor.fetchall()
        
        return PaginatedResponse(
            items=[DeviceResponse(**dict(device)) for device in devices],
            total=total,
            page=page,
            size=size,
            pages=math.ceil(total / size)
        )


@router.post(
    "/",
    response_model=DeviceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Device",
    description="Create a new IoT device"
)
async def create_device(
    device_data: DeviceCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Create a new IoT device.
    
    - **name**: Device name (required)
    - **description**: Device description (optional)
    - **location**: Device location (optional)
    - **device_type**: Type of device (required)
    - **status**: Device status (default: offline)
    """
    
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO devices (name, description, location, device_type, status, user_id, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
            RETURNING id, name, description, location, device_type, status, user_id, created_at, updated_at
            """,
            (
                device_data.name,
                device_data.description,
                device_data.location,
                device_data.device_type,
                device_data.status.value,
                current_user["id"]
            )
        )
        
        device = cursor.fetchone()
        return DeviceResponse(**dict(device))


@router.get(
    "/stats",
    summary="Get Device Statistics",
    description="Get overall device statistics for the current user"
)
async def get_device_stats(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get overall device statistics including:
    - Total devices
    - Online/offline count
    - Device status distribution
    """
    
    with get_db_cursor() as cursor:
        # Get total devices count
        cursor.execute(
            "SELECT COUNT(*) FROM devices WHERE user_id = %s",
            (current_user["id"],)
        )
        total_devices = cursor.fetchone()["count"]
        
        # Get status distribution
        cursor.execute(
            """
            SELECT status, COUNT(*) as count 
            FROM devices 
            WHERE user_id = %s 
            GROUP BY status
            """,
            (current_user["id"],)
        )
        status_counts = cursor.fetchall()
        
        # Get device type distribution
        cursor.execute(
            """
            SELECT device_type, COUNT(*) as count 
            FROM devices 
            WHERE user_id = %s 
            GROUP BY device_type
            """,
            (current_user["id"],)
        )
        type_counts = cursor.fetchall()
        
        # Calculate online/offline counts
        online_count = 0
        offline_count = 0
        maintenance_count = 0
        
        for status_row in status_counts:
            if status_row["status"] == "online":
                online_count = status_row["count"]
            elif status_row["status"] == "offline":
                offline_count = status_row["count"]
            elif status_row["status"] == "maintenance":
                maintenance_count = status_row["count"]
        
        # Get recent data count (sensors data from last hour)
        cursor.execute(
            """
            SELECT COUNT(*) 
            FROM sensor_data s
            JOIN devices d ON s.device_id = d.id 
            WHERE d.user_id = %s 
            AND s.timestamp >= NOW() - INTERVAL '1 hour'
            """,
            (current_user["id"],)
        )
        recent_data_count = cursor.fetchone()["count"]
        
        return {
            "total_devices": total_devices,
            "online_devices": online_count,
            "offline_devices": offline_count,
            "maintenance_devices": maintenance_count,
            "recent_data_count": recent_data_count,
            "status_distribution": [dict(row) for row in status_counts],
            "type_distribution": [dict(row) for row in type_counts]
        }


@router.get(
    "/{device_id}",
    response_model=DeviceResponse,
    summary="Get Device",
    description="Get a specific device by ID"
)
async def get_device(
    device_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get a specific device by ID.
    
    Device must belong to the current user.
    """
    
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, name, description, location, device_type, status, user_id, created_at, updated_at
            FROM devices 
            WHERE id = %s AND user_id = %s
            """,
            (device_id, current_user["id"])
        )
        
        device = cursor.fetchone()
        
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )
        
        return DeviceResponse(**dict(device))


@router.put(
    "/{device_id}",
    response_model=DeviceResponse,
    summary="Update Device",
    description="Update a device's information"
)
async def update_device(
    device_id: int,
    device_data: DeviceUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update a device's information.
    
    Only provided fields will be updated.
    Device must belong to the current user.
    """
    
    with get_db_cursor() as cursor:
        # Check if device exists and belongs to user
        cursor.execute(
            "SELECT id FROM devices WHERE id = %s AND user_id = %s",
            (device_id, current_user["id"])
        )
        
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )
        
        # Build update query
        update_fields = []
        params = []
        
        for field, value in device_data.model_dump(exclude_unset=True).items():
            if value is not None:
                update_fields.append(f"{field} = %s")
                params.append(value.value if hasattr(value, 'value') else value)
        
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        update_fields.append("updated_at = NOW()")
        params.extend([device_id, current_user["id"]])
        
        cursor.execute(
            f"""
            UPDATE devices 
            SET {', '.join(update_fields)}
            WHERE id = %s AND user_id = %s
            RETURNING id, name, description, location, device_type, status, user_id, created_at, updated_at
            """,
            params
        )
        
        device = cursor.fetchone()
        return DeviceResponse(**dict(device))


@router.delete(
    "/{device_id}",
    response_model=MessageResponse,
    summary="Delete Device",
    description="Delete a device and all its sensor data"
)
async def delete_device(
    device_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Delete a device and all its associated sensor data.
    
    Device must belong to the current user.
    This action cannot be undone.
    """
    
    with get_db_cursor() as cursor:
        # Check if device exists and belongs to user
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
        
        # Delete sensor data first (foreign key constraint)
        cursor.execute(
            "DELETE FROM sensor_data WHERE device_id = %s",
            (device_id,)
        )
        
        # Delete device
        cursor.execute(
            "DELETE FROM devices WHERE id = %s AND user_id = %s",
            (device_id, current_user["id"])
        )
        
        return MessageResponse(
            message=f"Device '{device['name']}' deleted successfully"
        )


@router.get(
    "/{device_id}/status-history",
    summary="Get Device Status History",
    description="Get status history for a specific device with uptime information"
)
async def get_device_status_history(
    device_id: int,
    limit: int = Query(50, ge=1, le=200, description="Number of history records to return"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get status history for a specific device.
    
    Returns historical status changes with uptime information:
    - Status changes (online/offline/maintenance)
    - Uptime duration for each online session
    - Timestamps of status changes
    """
    
    with get_db_cursor() as cursor:
        # Verify device belongs to user
        cursor.execute(
            "SELECT id, name FROM devices WHERE id = %s AND user_id = %s",
            (device_id, current_user["id"])
        )
        
        device = cursor.fetchone()
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )
        
        # Get status history
        history = DeviceStatusService.get_device_status_history(device_id, limit)
        
        # Get current uptime if device is online
        current_uptime = DeviceStatusService.get_device_current_uptime(device_id)
        
        return {
            "device_id": device_id,
            "device_name": device["name"],
            "current_uptime_seconds": current_uptime,
            "current_uptime_formatted": DeviceStatusService.format_uptime(current_uptime),
            "history": [
                {
                    **record,
                    "uptime_formatted": DeviceStatusService.format_uptime(record.get("uptime_seconds"))
                }
                for record in history
            ],
            "total_records": len(history)
        }


@router.post(
    "/{device_id}/ping",
    summary="Ping Device",
    description="Manually ping a device to update its last_seen timestamp"
)
async def ping_device(
    device_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Manually ping a device to update its last_seen timestamp.
    
    This endpoint can be used to manually mark a device as active
    when sensor data is not being sent but the device is still responsive.
    """
    
    with get_db_cursor() as cursor:
        # Verify device belongs to user
        cursor.execute(
            "SELECT id, name FROM devices WHERE id = %s AND user_id = %s",
            (device_id, current_user["id"])
        )
        
        device = cursor.fetchone()
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )
        
        # Update last_seen and mark as online
        success = DeviceStatusService.update_device_last_seen(device_id)
        
        if success:
            return MessageResponse(
                message=f"Device '{device['name']}' pinged successfully"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to ping device"
            )