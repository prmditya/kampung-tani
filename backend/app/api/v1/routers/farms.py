"""
Farm Management Router
CRUD operations for agricultural farms with async SQLAlchemy
"""

from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import math
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.farm import Farm
from app.api.v1.repositories.farm_repository import FarmRepository
from app.api.v1.repositories.farmer_repository import FarmerRepository
from app.api.v1.schemas import (
    PaginatedResponse,
    MessageResponse,
)
from app.api.v1.schemas.farm import (
    FarmCreate,
    FarmUpdate,
    FarmResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/",
    response_model=PaginatedResponse[FarmResponse],
    summary="Get All Farms",
    description="Get paginated list of all farms"
)
async def get_farms(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search farms by name"),
    farmer_id: Optional[int] = Query(None, description="Filter by farmer ID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated list of all farms.

    - **page**: Page number (default: 1)
    - **size**: Items per page (default: 20, max: 100)
    - **search**: Search farms by name (optional)
    - **farmer_id**: Filter by farmer ID (optional)
    """
    farm_repo = FarmRepository(db)

    # Get paginated farms
    skip = (page - 1) * size

    if search or farmer_id:
        farms = await farm_repo.search_by_name(
            search=search or "",
            farmer_id=farmer_id,
            skip=skip,
            limit=size
        )
        total = await farm_repo.count_with_search(search=search, farmer_id=farmer_id)
    else:
        farms = await farm_repo.get_all(skip=skip, limit=size, order_by=Farm.created_at.desc())
        total = await farm_repo.count()

    return PaginatedResponse(
        items=[FarmResponse.model_validate(f) for f in farms],
        total=total,
        page=page,
        size=size,
        pages=math.ceil(total / size) if total > 0 else 0
    )


@router.post(
    "/",
    response_model=FarmResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Farm",
    description="Create a new farm"
)
async def create_farm(
    farm_data: FarmCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new farm.

    - **farmer_id**: Farmer ID (required)
    - **name**: Farm name (required)
    - **location**: Location description (optional)
    - **latitude**: Latitude coordinate (optional)
    - **longitude**: Longitude coordinate (optional)
    - **area_size**: Area size in hectares (optional)
    - **soil_type**: Soil type (optional)
    """
    farm_repo = FarmRepository(db)
    farmer_repo = FarmerRepository(db)

    # Verify farmer exists
    farmer = await farmer_repo.get_by_id(farm_data.farmer_id)
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farmer with ID {farm_data.farmer_id} not found"
        )

    try:
        farm = await farm_repo.create(
            farmer_id=farm_data.farmer_id,
            name=farm_data.name,
            location=farm_data.location,
            latitude=farm_data.latitude,
            longitude=farm_data.longitude,
            area_size=farm_data.area_size,
            soil_type=farm_data.soil_type
        )

        await db.commit()

        logger.info(f"Farm created: {farm.name} for farmer {farmer.name} by user {current_user.username}")
        return FarmResponse.model_validate(farm)

    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating farm: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create farm"
        )


@router.get(
    "/{farm_id}",
    response_model=FarmResponse,
    summary="Get Farm",
    description="Get a specific farm by ID"
)
async def get_farm(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific farm by ID.
    """
    farm_repo = FarmRepository(db)

    farm = await farm_repo.get_by_id(farm_id)

    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )

    return FarmResponse.model_validate(farm)


@router.put(
    "/{farm_id}",
    response_model=FarmResponse,
    summary="Update Farm",
    description="Update a farm's information"
)
async def update_farm(
    farm_id: int,
    farm_data: FarmUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a farm's information.

    Only provided fields will be updated.
    """
    farm_repo = FarmRepository(db)

    # Check if farm exists
    farm = await farm_repo.get_by_id(farm_id)

    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )

    # Prepare update data
    update_data = farm_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )

    # If farmer_id is being updated, verify the new farmer exists
    if "farmer_id" in update_data:
        farmer_repo = FarmerRepository(db)
        farmer = await farmer_repo.get_by_id(update_data["farmer_id"])
        if not farmer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Farmer with ID {update_data['farmer_id']} not found"
            )

    try:
        updated_farm = await farm_repo.update(farm_id, **update_data)

        await db.commit()

        logger.info(f"Farm updated: {farm.name} by user {current_user.username}")
        return FarmResponse.model_validate(updated_farm)

    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating farm: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update farm"
        )


@router.delete(
    "/{farm_id}",
    response_model=MessageResponse,
    summary="Delete Farm",
    description="Delete a farm and all associated gateway assignments"
)
async def delete_farm(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a farm and all associated gateway assignments.

    This action cannot be undone.
    """
    farm_repo = FarmRepository(db)

    # Check if farm exists
    farm = await farm_repo.get_by_id(farm_id)

    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )

    farm_name = farm.name

    try:
        # Delete farm (cascade will handle gateway assignments)
        await farm_repo.delete(farm_id)

        await db.commit()

        logger.info(f"Farm deleted: {farm_name} by user {current_user.username}")

        return MessageResponse(
            message=f"Farm '{farm_name}' deleted successfully"
        )

    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting farm: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete farm"
        )
