"""
Gateway Management Router
CRUD operations for IoT gateway devices with async SQLAlchemy
"""

from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import math
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.gateway import Gateway
from app.api.v1.repositories.gateway_repository import GatewayRepository
from app.api.v1.repositories.sensor_repository import SensorRepository
from app.api.v1.repositories.sensor_data_repository import SensorDataRepository
from app.api.v1.schemas import (
    GatewayCreate,
    GatewayUpdate,
    GatewayResponse,
    PaginatedResponse,
    MessageResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/",
    response_model=PaginatedResponse[GatewayResponse],
    summary="Get User Gateways",
    description="Get paginated list of gateways for current user"
)
async def get_user_gateways(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search gateways by name or UID"),
    status: Optional[str] = Query(None, description="Filter by gateway status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated list of gateways for the current user.

    - **page**: Page number (default: 1)
    - **size**: Items per page (default: 20, max: 100)
    - **search**: Search gateways by name or UID (optional)
    - **status**: Filter by gateway status (optional)
    """
    gateway_repo = GatewayRepository(db)

    # Get paginated gateways
    skip = (page - 1) * size
    gateways = await gateway_repo.get_by_user(
        user_id=current_user.id,
        skip=skip,
        limit=size,
        status=status,
        search=search
    )

    # Get total count
    total = await gateway_repo.count_by_user(
        user_id=current_user.id,
        status=status,
        search=search
    )

    return PaginatedResponse(
        items=[GatewayResponse.model_validate(gw) for gw in gateways],
        total=total,
        page=page,
        size=size,
        pages=math.ceil(total / size) if total > 0 else 0
    )


@router.post(
    "/",
    response_model=GatewayResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Gateway",
    description="Create a new IoT gateway device"
)
async def create_gateway(
    gateway_data: GatewayCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new IoT gateway.

    - **gateway_uid**: Unique gateway identifier (required)
    - **name**: Gateway name (optional)
    - **mac_address**: MAC address (optional)
    - **description**: Gateway description (optional)
    - **status**: Gateway status (default: offline)
    """
    gateway_repo = GatewayRepository(db)

    # Check if gateway UID already exists
    if await gateway_repo.gateway_uid_exists(gateway_data.gateway_uid):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Gateway with UID '{gateway_data.gateway_uid}' already exists"
        )

    try:
        gateway = await gateway_repo.create(
            user_id=current_user.id,
            gateway_uid=gateway_data.gateway_uid,
            name=gateway_data.name,
            mac_address=gateway_data.mac_address,
            description=gateway_data.description,
            status=gateway_data.status.value
        )

        logger.info(f"Gateway created: {gateway.gateway_uid} by user {current_user.username}")
        return GatewayResponse.model_validate(gateway)

    except Exception as e:
        logger.error(f"Error creating gateway: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create gateway"
        )


@router.get(
    "/stats",
    summary="Get Gateway Statistics",
    description="Get overall gateway statistics for the current user"
)
async def get_gateway_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get overall gateway statistics including:
    - Total gateways
    - Online/offline count
    - Gateway status distribution
    """
    gateway_repo = GatewayRepository(db)

    # Get total gateways count
    total_gateways = await gateway_repo.count_by_user(user_id=current_user.id)

    # Get status distribution
    status_distribution = await gateway_repo.get_status_distribution_by_user(
        user_id=current_user.id
    )

    # Calculate counts from distribution
    online_count = 0
    offline_count = 0
    maintenance_count = 0

    for item in status_distribution:
        if item["status"] == "online":
            online_count = item["count"]
        elif item["status"] == "offline":
            offline_count = item["count"]
        elif item["status"] == "maintenance":
            maintenance_count = item["count"]

    return {
        "total_gateways": total_gateways,
        "online_gateways": online_count,
        "offline_gateways": offline_count,
        "maintenance_gateways": maintenance_count,
        "status_distribution": status_distribution
    }


@router.get(
    "/{gateway_id}",
    summary="Get Gateway",
    description="Get a specific gateway by ID with its sensors"
)
async def get_gateway(
    gateway_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific gateway by ID.

    Gateway must belong to the current user.
    """
    gateway_repo = GatewayRepository(db)

    gateway = await gateway_repo.get_with_sensors(
        gateway_id=gateway_id,
        user_id=current_user.id
    )

    if not gateway:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gateway not found"
        )

    return GatewayResponse.model_validate(gateway)


@router.put(
    "/{gateway_id}",
    response_model=GatewayResponse,
    summary="Update Gateway",
    description="Update a gateway's information"
)
async def update_gateway(
    gateway_id: int,
    gateway_data: GatewayUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a gateway's information.

    Only provided fields will be updated.
    Gateway must belong to the current user.
    """
    gateway_repo = GatewayRepository(db)

    # Check if gateway exists and belongs to user
    gateway = await gateway_repo.get_by_id(gateway_id)

    if not gateway or gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gateway not found"
        )

    # Prepare update data
    update_data = gateway_data.model_dump(exclude_unset=True)

    # Convert enum to string if present
    if "status" in update_data and update_data["status"]:
        update_data["status"] = update_data["status"].value

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )

    try:
        updated_gateway = await gateway_repo.update(gateway_id, **update_data)

        logger.info(f"Gateway updated: {gateway.gateway_uid} by user {current_user.username}")
        return GatewayResponse.model_validate(updated_gateway)

    except Exception as e:
        logger.error(f"Error updating gateway: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update gateway"
        )


@router.delete(
    "/{gateway_id}",
    response_model=MessageResponse,
    summary="Delete Gateway",
    description="Delete a gateway and all its sensor data"
)
async def delete_gateway(
    gateway_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a gateway and all its associated sensors and sensor data.

    Gateway must belong to the current user.
    This action cannot be undone.
    """
    gateway_repo = GatewayRepository(db)

    # Check if gateway exists and belongs to user
    gateway = await gateway_repo.get_by_id(gateway_id)

    if not gateway or gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gateway not found"
        )

    gateway_uid = gateway.gateway_uid

    try:
        # Delete gateway (cascade will handle sensors and sensor_data)
        await gateway_repo.delete(gateway_id)

        logger.info(f"Gateway deleted: {gateway_uid} by user {current_user.username}")

        return MessageResponse(
            message=f"Gateway '{gateway_uid}' deleted successfully"
        )

    except Exception as e:
        logger.error(f"Error deleting gateway: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete gateway"
        )


@router.post(
    "/{gateway_id}/ping",
    response_model=MessageResponse,
    summary="Ping Gateway",
    description="Manually ping a gateway to update its last_seen timestamp"
)
async def ping_gateway(
    gateway_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Manually ping a gateway to update its last_seen timestamp.

    This endpoint can be used to manually mark a gateway as active
    when sensor data is not being sent but the gateway is still responsive.
    """
    gateway_repo = GatewayRepository(db)

    # Verify gateway belongs to user
    gateway = await gateway_repo.get_by_id(gateway_id)

    if not gateway or gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gateway not found"
        )

    # Update last_seen
    success = await gateway_repo.update_last_seen(gateway_id, status="online")

    if success:
        logger.info(f"Gateway pinged: {gateway.gateway_uid} by user {current_user.username}")
        return MessageResponse(
            message=f"Gateway '{gateway.gateway_uid}' pinged successfully"
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to ping gateway"
        )
