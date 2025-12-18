"""
Summary Router
Farm summary statistics and share link management
"""

from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime, timedelta
import math
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.summary_share import SummaryShare
from app.api.repositories.sensor_data_repository import SensorDataRepository
from app.api.repositories.farm_repository import FarmRepository
from app.api.schemas import MessageResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/farm/{farm_id}",
    summary="Get Farm Summary",
    description="Get aggregated sensor data summary for a farm"
)
async def get_farm_summary(
    farm_id: int,
    start_date: Optional[datetime] = Query(None, description="Start date filter (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="End date filter (ISO format)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get summary statistics for all sensor data in a farm.

    - **farm_id**: Farm ID (required)
    - **start_date**: Start date filter in ISO format (optional)
    - **end_date**: End date filter in ISO format (optional)

    Returns aggregated statistics (min, max, avg, count) grouped by measurement type.
    """
    farm_repo = FarmRepository(db)
    sensor_data_repo = SensorDataRepository(db)

    # Check if farm exists
    farm = await farm_repo.get_by_id(farm_id)

    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farm with ID {farm_id} not found"
        )

    # Strip timezone info to make datetime timezone-naive
    if start_date and start_date.tzinfo:
        start_date = start_date.replace(tzinfo=None)
    if end_date and end_date.tzinfo:
        end_date = end_date.replace(tzinfo=None)

    # Get summary statistics
    summary = await sensor_data_repo.get_farm_summary_statistics(
        farm_id=farm_id,
        start_date=start_date,
        end_date=end_date
    )

    return {
        "farm_id": farm_id,
        "farm_name": farm.name,
        "farmer_id": farm.farmer_id,
        "start_date": start_date,
        "end_date": end_date,
        "summary": summary
    }


# ============ Summary Share Endpoints ============

@router.post(
    "/share",
    summary="Create Share Link",
    description="Generate a shareable link for a farm summary report"
)
async def create_summary_share(
    farm_id: int,
    start_date: Optional[datetime] = Query(None, description="Start date filter (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="End date filter (ISO format)"),
    expires_in_days: int = Query(30, ge=1, le=365, description="Link expiration in days"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a shareable link for a farm summary.
    
    - **farm_id**: Farm ID (required)
    - **start_date**: Start date filter (optional)
    - **end_date**: End date filter (optional)
    - **expires_in_days**: Link expiration in days (default: 30, max: 365)
    
    Returns the share token and URL.
    """
    farm_repo = FarmRepository(db)
    
    # Check if farm exists
    farm = await farm_repo.get_by_id(farm_id)
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farm with ID {farm_id} not found"
        )
    
    # Strip timezone info
    if start_date and start_date.tzinfo:
        start_date = start_date.replace(tzinfo=None)
    if end_date and end_date.tzinfo:
        end_date = end_date.replace(tzinfo=None)
    
    # Create share record
    share = SummaryShare(
        farm_id=farm_id,
        created_by=current_user.id,
        start_date=start_date,
        end_date=end_date,
        expires_at=datetime.utcnow() + timedelta(days=expires_in_days)
    )
    
    db.add(share)
    await db.commit()
    await db.refresh(share)
    
    return {
        "token": share.token,
        "url": f"/share/summary/{share.token}",
        "farm_id": farm_id,
        "farm_name": farm.name,
        "expires_at": share.expires_at,
        "created_at": share.created_at
    }


@router.get(
    "/share/{token}",
    summary="Get Shared Summary (Public)",
    description="Get a shared summary report by token - no authentication required"
)
async def get_shared_summary(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get shared summary by token. This endpoint is PUBLIC (no auth required).
    
    - **token**: The share token from the URL
    
    Returns the farm summary data including farm info.
    """
    # Find share by token
    result = await db.execute(
        select(SummaryShare).where(SummaryShare.token == token)
    )
    share = result.scalar_one_or_none()
    
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link not found"
        )
    
    if not share.is_active:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This share link has been revoked"
        )
    
    if share.is_expired:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This share link has expired"
        )
    
    # Get farm data
    farm_repo = FarmRepository(db)
    farm = await farm_repo.get_by_id(share.farm_id)
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )
    
    # Get farmer data
    from app.api.repositories.farmer_repository import FarmerRepository
    farmer_repo = FarmerRepository(db)
    farmer = await farmer_repo.get_by_id(farm.farmer_id)
    
    # Get summary statistics
    sensor_data_repo = SensorDataRepository(db)
    summary = await sensor_data_repo.get_farm_summary_statistics(
        farm_id=share.farm_id,
        start_date=share.start_date,
        end_date=share.end_date
    )
    
    return {
        "farm_id": share.farm_id,
        "farm_name": farm.name,
        "farm_location": farm.location,
        "farm_latitude": farm.latitude,
        "farm_longitude": farm.longitude,
        "farmer_id": farm.farmer_id,
        "farmer_name": farmer.name if farmer else None,
        "start_date": share.start_date,
        "end_date": share.end_date,
        "summary": summary,
        "created_at": share.created_at,
        "expires_at": share.expires_at
    }


@router.get(
    "/shares",
    summary="List My Shares",
    description="Get all share links created by the current user"
)
async def list_my_shares(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all share links created by the current user.
    
    - **page**: Page number (default: 1)
    - **size**: Items per page (default: 20)
    
    Returns paginated list of share links.
    """
    # Count total
    count_result = await db.execute(
        select(func.count(SummaryShare.id)).where(
            SummaryShare.created_by == current_user.id
        )
    )
    total = count_result.scalar() or 0
    
    # Get shares with pagination
    result = await db.execute(
        select(SummaryShare)
        .where(SummaryShare.created_by == current_user.id)
        .order_by(SummaryShare.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    shares = result.scalars().all()
    
    items = []
    for share in shares:
        items.append({
            "id": share.id,
            "token": share.token,
            "url": f"/share/summary/{share.token}",
            "farm_id": share.farm_id,
            "farm_name": share.farm.name if share.farm else None,
            "start_date": share.start_date,
            "end_date": share.end_date,
            "is_active": share.is_active,
            "is_expired": share.is_expired,
            "is_valid": share.is_valid,
            "created_at": share.created_at,
            "expires_at": share.expires_at
        })
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": math.ceil(total / size) if total > 0 else 0
    }


@router.delete(
    "/share/{token}",
    response_model=MessageResponse,
    summary="Delete Share Link",
    description="Permanently delete a share link"
)
async def delete_summary_share(
    token: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a share link. Only the creator can delete their links.
    
    - **token**: The share token to delete
    """
    # Find share by token
    result = await db.execute(
        select(SummaryShare).where(
            SummaryShare.token == token,
            SummaryShare.created_by == current_user.id
        )
    )
    share = result.scalar_one_or_none()
    
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link not found or you don't have permission to delete it"
        )
    
    await db.delete(share)
    await db.commit()
    
    return {"message": "Share link deleted successfully"}
