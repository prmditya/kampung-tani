"""
Gateway Status History Router
Track and query gateway status changes with async SQLAlchemy
"""

from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime
import math
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.api.v1.repositories.gateway_status_history_repository import GatewayStatusHistoryRepository
from app.api.v1.repositories.gateway_repository import GatewayRepository
from app.api.v1.schemas import (
    PaginatedResponse,
    MessageResponse,
)
from app.api.v1.schemas.gateway_status_history import (
    GatewayStatusHistoryCreate,
    GatewayStatusHistoryResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/gateway/{gateway_id}",
    response_model=PaginatedResponse[GatewayStatusHistoryResponse],
    summary="Get Gateway Status History",
    description="Get paginated status history for a specific gateway"
)
async def get_gateway_status_history(
    gateway_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    start_date: Optional[datetime] = Query(None, description="Filter records after this date"),
    end_date: Optional[datetime] = Query(None, description="Filter records before this date"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated status history for a specific gateway.

    - **gateway_id**: Gateway ID (required)
    - **page**: Page number (default: 1)
    - **size**: Items per page (default: 20, max: 100)
    - **start_date**: Filter records after this date (optional)
    - **end_date**: Filter records before this date (optional)
    """
    gateway_repo = GatewayRepository(db)
    history_repo = GatewayStatusHistoryRepository(db)

    # Verify gateway exists and belongs to user
    gateway = await gateway_repo.get_by_id(gateway_id)
    if not gateway:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gateway not found"
        )

    if gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view status history for your own gateways"
        )

    # Get paginated history
    skip = (page - 1) * size
    history = await history_repo.get_by_gateway(
        gateway_id=gateway_id,
        skip=skip,
        limit=size,
        start_date=start_date,
        end_date=end_date
    )

    total = await history_repo.count_by_gateway(
        gateway_id=gateway_id,
        start_date=start_date,
        end_date=end_date
    )

    return PaginatedResponse(
        items=[GatewayStatusHistoryResponse.model_validate(h) for h in history],
        total=total,
        page=page,
        size=size,
        pages=math.ceil(total / size) if total > 0 else 0
    )


@router.post(
    "/",
    response_model=GatewayStatusHistoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Status History Entry",
    description="Create a new gateway status history entry"
)
async def create_status_history(
    history_data: GatewayStatusHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new gateway status history entry.

    - **gateway_id**: Gateway ID (required)
    - **status**: Status value (required)
    - **uptime_seconds**: Uptime in seconds (optional)
    """
    gateway_repo = GatewayRepository(db)
    history_repo = GatewayStatusHistoryRepository(db)

    # Verify gateway exists and belongs to user
    gateway = await gateway_repo.get_by_id(history_data.gateway_id)
    if not gateway:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gateway with ID {history_data.gateway_id} not found"
        )

    if gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create status history for your own gateways"
        )

    try:
        history = await history_repo.create(
            gateway_id=history_data.gateway_id,
            status=history_data.status,
            uptime_seconds=history_data.uptime_seconds
        )

        await db.commit()

        logger.info(
            f"Gateway status history created: Gateway {gateway.gateway_uid} "
            f"status={history_data.status} by user {current_user.username}"
        )
        return GatewayStatusHistoryResponse.model_validate(history)

    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating gateway status history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create gateway status history"
        )


@router.get(
    "/gateway/{gateway_id}/latest",
    response_model=GatewayStatusHistoryResponse,
    summary="Get Latest Status",
    description="Get the most recent status history entry for a gateway"
)
async def get_latest_status(
    gateway_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the most recent status history entry for a gateway.
    """
    gateway_repo = GatewayRepository(db)
    history_repo = GatewayStatusHistoryRepository(db)

    # Verify gateway exists and belongs to user
    gateway = await gateway_repo.get_by_id(gateway_id)
    if not gateway:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gateway not found"
        )

    if gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view status history for your own gateways"
        )

    latest = await history_repo.get_latest_by_gateway(gateway_id)

    if not latest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No status history found for this gateway"
        )

    return GatewayStatusHistoryResponse.model_validate(latest)


@router.get(
    "/gateway/{gateway_id}/stats",
    summary="Get Gateway Uptime Statistics",
    description="Get uptime statistics for a gateway"
)
async def get_uptime_statistics(
    gateway_id: int,
    start_date: Optional[datetime] = Query(None, description="Filter records after this date"),
    end_date: Optional[datetime] = Query(None, description="Filter records before this date"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get uptime statistics for a gateway including:
    - Total records
    - Average uptime
    - Maximum uptime
    - Minimum uptime
    """
    gateway_repo = GatewayRepository(db)
    history_repo = GatewayStatusHistoryRepository(db)

    # Verify gateway exists and belongs to user
    gateway = await gateway_repo.get_by_id(gateway_id)
    if not gateway:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gateway not found"
        )

    if gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view statistics for your own gateways"
        )

    stats = await history_repo.get_uptime_statistics(
        gateway_id=gateway_id,
        start_date=start_date,
        end_date=end_date
    )

    return stats


@router.get(
    "/gateway/{gateway_id}/status-distribution",
    summary="Get Status Distribution",
    description="Get status distribution for a gateway"
)
async def get_status_distribution(
    gateway_id: int,
    start_date: Optional[datetime] = Query(None, description="Filter records after this date"),
    end_date: Optional[datetime] = Query(None, description="Filter records before this date"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get status distribution for a gateway showing count of each status.
    """
    gateway_repo = GatewayRepository(db)
    history_repo = GatewayStatusHistoryRepository(db)

    # Verify gateway exists and belongs to user
    gateway = await gateway_repo.get_by_id(gateway_id)
    if not gateway:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gateway not found"
        )

    if gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view statistics for your own gateways"
        )

    distribution = await history_repo.get_status_distribution(
        gateway_id=gateway_id,
        start_date=start_date,
        end_date=end_date
    )

    return {"gateway_id": gateway_id, "status_distribution": distribution}


@router.get(
    "/gateway/{gateway_id}/recent-changes",
    response_model=list[GatewayStatusHistoryResponse],
    summary="Get Recent Status Changes",
    description="Get recent status changes for a gateway"
)
async def get_recent_changes(
    gateway_id: int,
    hours: int = Query(24, ge=1, le=168, description="Number of hours to look back"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get recent status changes for a gateway in the last N hours.

    - **gateway_id**: Gateway ID (required)
    - **hours**: Number of hours to look back (default: 24, max: 168)
    """
    gateway_repo = GatewayRepository(db)
    history_repo = GatewayStatusHistoryRepository(db)

    # Verify gateway exists and belongs to user
    gateway = await gateway_repo.get_by_id(gateway_id)
    if not gateway:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gateway not found"
        )

    if gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view status changes for your own gateways"
        )

    changes = await history_repo.get_status_changes_by_gateway(
        gateway_id=gateway_id,
        hours=hours
    )

    return [GatewayStatusHistoryResponse.model_validate(c) for c in changes]
