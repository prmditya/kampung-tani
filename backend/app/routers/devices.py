"""
Device Management Router
CRUD operations for IoT devices
"""

from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import Dict, Any, List, Optional
import math

from app.core.database import get_db_cursor
from app.core.security import get_current_user
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