"""
Farmer Management Router
CRUD operations for farm owners with async SQLAlchemy
"""

from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import math
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.farmer import Farmer
from app.api.v1.repositories.farmer_repository import FarmerRepository
from app.api.v1.schemas import (
    PaginatedResponse,
    MessageResponse,
)
from app.api.v1.schemas.farmer import (
    FarmerCreate,
    FarmerUpdate,
    FarmerResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/",
    response_model=PaginatedResponse[FarmerResponse],
    summary="Get All Farmers",
    description="Get paginated list of all farmers"
)
async def get_farmers(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search farmers by name"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated list of all farmers.

    - **page**: Page number (default: 1)
    - **size**: Items per page (default: 20, max: 100)
    - **search**: Search farmers by name (optional)
    """
    farmer_repo = FarmerRepository(db)

    # Get paginated farmers
    skip = (page - 1) * size

    if search:
        farmers = await farmer_repo.search_by_name(
            search=search,
            skip=skip,
            limit=size
        )
        total = await farmer_repo.count_with_search(search=search)
    else:
        farmers = await farmer_repo.get_all(skip=skip, limit=size, order_by=Farmer.name)
        total = await farmer_repo.count()

    return PaginatedResponse(
        items=[FarmerResponse.model_validate(f) for f in farmers],
        total=total,
        page=page,
        size=size,
        pages=math.ceil(total / size) if total > 0 else 0
    )


@router.post(
    "/",
    response_model=FarmerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Farmer",
    description="Create a new farmer"
)
async def create_farmer(
    farmer_data: FarmerCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new farmer.

    - **name**: Farmer name (required)
    - **contact**: Contact information (optional)
    - **address**: Address (optional)
    """
    farmer_repo = FarmerRepository(db)

    try:
        farmer = await farmer_repo.create(
            name=farmer_data.name,
            contact=farmer_data.contact,
            address=farmer_data.address
        )

        await db.commit()

        logger.info(f"Farmer created: {farmer.name} by user {current_user.username}")
        return FarmerResponse.model_validate(farmer)

    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating farmer: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create farmer"
        )


@router.get(
    "/{farmer_id}",
    response_model=FarmerResponse,
    summary="Get Farmer",
    description="Get a specific farmer by ID"
)
async def get_farmer(
    farmer_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific farmer by ID.
    """
    farmer_repo = FarmerRepository(db)

    farmer = await farmer_repo.get_by_id(farmer_id)

    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer not found"
        )

    return FarmerResponse.model_validate(farmer)


@router.put(
    "/{farmer_id}",
    response_model=FarmerResponse,
    summary="Update Farmer",
    description="Update a farmer's information"
)
async def update_farmer(
    farmer_id: int,
    farmer_data: FarmerUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a farmer's information.

    Only provided fields will be updated.
    """
    farmer_repo = FarmerRepository(db)

    # Check if farmer exists
    farmer = await farmer_repo.get_by_id(farmer_id)

    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer not found"
        )

    # Prepare update data
    update_data = farmer_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )

    try:
        updated_farmer = await farmer_repo.update(farmer_id, **update_data)

        await db.commit()

        logger.info(f"Farmer updated: {farmer.name} by user {current_user.username}")
        return FarmerResponse.model_validate(updated_farmer)

    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating farmer: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update farmer"
        )


@router.delete(
    "/{farmer_id}",
    response_model=MessageResponse,
    summary="Delete Farmer",
    description="Delete a farmer and all associated farms"
)
async def delete_farmer(
    farmer_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a farmer and all associated farms.

    This action cannot be undone.
    """
    farmer_repo = FarmerRepository(db)

    # Check if farmer exists
    farmer = await farmer_repo.get_by_id(farmer_id)

    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer not found"
        )

    farmer_name = farmer.name

    try:
        # Delete farmer (cascade will handle farms)
        await farmer_repo.delete(farmer_id)

        await db.commit()

        logger.info(f"Farmer deleted: {farmer_name} by user {current_user.username}")

        return MessageResponse(
            message=f"Farmer '{farmer_name}' deleted successfully"
        )

    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting farmer: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete farmer"
        )
