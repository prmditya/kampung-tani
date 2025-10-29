"""
Gateway Assignment Router
CRUD operations for gateway-to-farm assignments with async SQLAlchemy
"""

from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import math
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.api.v1.repositories.gateway_assignment_repository import GatewayAssignmentRepository
from app.api.v1.repositories.gateway_repository import GatewayRepository
from app.api.v1.repositories.farm_repository import FarmRepository
from app.api.v1.schemas import (
    PaginatedResponse,
    MessageResponse,
)
from app.api.v1.schemas.gateway_assignment import (
    GatewayAssignmentCreate,
    GatewayAssignmentUpdate,
    GatewayAssignmentResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/",
    response_model=PaginatedResponse[GatewayAssignmentResponse],
    summary="Get Gateway Assignments",
    description="Get paginated list of gateway assignments"
)
async def get_assignments(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    gateway_id: Optional[int] = Query(None, description="Filter by gateway ID"),
    farm_id: Optional[int] = Query(None, description="Filter by farm ID"),
    active_only: bool = Query(False, description="Show only active assignments"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated list of gateway assignments.

    - **page**: Page number (default: 1)
    - **size**: Items per page (default: 20, max: 100)
    - **gateway_id**: Filter by gateway ID (optional)
    - **farm_id**: Filter by farm ID (optional)
    - **active_only**: Show only active assignments (default: false)
    """
    assignment_repo = GatewayAssignmentRepository(db)

    skip = (page - 1) * size

    # Get assignments based on filters
    if gateway_id:
        assignments = await assignment_repo.get_by_gateway(
            gateway_id=gateway_id,
            active_only=active_only,
            skip=skip,
            limit=size
        )
        total = await assignment_repo.count_by_gateway(gateway_id, active_only)
    elif farm_id:
        assignments = await assignment_repo.get_by_farm(
            farm_id=farm_id,
            active_only=active_only,
            skip=skip,
            limit=size
        )
        total = await assignment_repo.count_by_farm(farm_id, active_only)
    else:
        # Get all assignments
        if active_only:
            assignments = await assignment_repo.get_all(skip=skip, limit=size)
            assignments = [a for a in assignments if a.is_active]
            total = len(assignments)
        else:
            assignments = await assignment_repo.get_all(skip=skip, limit=size)
            total = await assignment_repo.count()

    return PaginatedResponse(
        items=[GatewayAssignmentResponse.model_validate(a) for a in assignments],
        total=total,
        page=page,
        size=size,
        pages=math.ceil(total / size) if total > 0 else 0
    )


@router.post(
    "/",
    response_model=GatewayAssignmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Gateway Assignment",
    description="Assign a gateway to a farm"
)
async def create_assignment(
    assignment_data: GatewayAssignmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new gateway assignment.

    - **gateway_id**: Gateway ID (required)
    - **farm_id**: Farm ID (required)
    - **start_date**: Assignment start date (optional, defaults to now)
    - **end_date**: Assignment end date (optional)
    """
    assignment_repo = GatewayAssignmentRepository(db)
    gateway_repo = GatewayRepository(db)
    farm_repo = FarmRepository(db)

    # Verify gateway exists and belongs to user
    gateway = await gateway_repo.get_by_id(assignment_data.gateway_id)
    if not gateway:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gateway with ID {assignment_data.gateway_id} not found"
        )

    if gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only assign your own gateways"
        )

    # Verify farm exists
    farm = await farm_repo.get_by_id(assignment_data.farm_id)
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farm with ID {assignment_data.farm_id} not found"
        )

    # Check if gateway already has an active assignment
    existing_assignment = await assignment_repo.get_active_assignment_for_gateway(
        assignment_data.gateway_id
    )

    if existing_assignment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Gateway is already assigned to farm ID {existing_assignment.farm_id}. "
                   f"Deactivate the current assignment first."
        )

    # Strip timezone info to make datetime timezone-naive (database uses TIMESTAMP WITHOUT TIME ZONE)
    start_date = assignment_data.start_date
    end_date = assignment_data.end_date

    if start_date and start_date.tzinfo:
        start_date = start_date.replace(tzinfo=None)
    if end_date and end_date.tzinfo:
        end_date = end_date.replace(tzinfo=None)

    try:
        assignment = await assignment_repo.create(
            gateway_id=assignment_data.gateway_id,
            farm_id=assignment_data.farm_id,
            assigned_by=current_user.id,
            start_date=start_date,
            end_date=end_date,
            is_active=True
        )

        await db.commit()

        logger.info(
            f"Gateway assignment created: Gateway {gateway.gateway_uid} -> "
            f"Farm {farm.name} by user {current_user.username}"
        )
        return GatewayAssignmentResponse.model_validate(assignment)

    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating gateway assignment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create gateway assignment"
        )


@router.get(
    "/{assignment_id}",
    response_model=GatewayAssignmentResponse,
    summary="Get Gateway Assignment",
    description="Get a specific gateway assignment by ID"
)
async def get_assignment(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific gateway assignment by ID.
    """
    assignment_repo = GatewayAssignmentRepository(db)

    assignment = await assignment_repo.get_by_id(assignment_id)

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gateway assignment not found"
        )

    return GatewayAssignmentResponse.model_validate(assignment)


@router.put(
    "/{assignment_id}",
    response_model=GatewayAssignmentResponse,
    summary="Update Gateway Assignment",
    description="Update a gateway assignment"
)
async def update_assignment(
    assignment_id: int,
    assignment_data: GatewayAssignmentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a gateway assignment.

    Only provided fields will be updated.
    """
    assignment_repo = GatewayAssignmentRepository(db)

    # Check if assignment exists
    assignment = await assignment_repo.get_by_id(assignment_id)

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gateway assignment not found"
        )

    # Verify user owns the gateway
    gateway_repo = GatewayRepository(db)
    gateway = await gateway_repo.get_by_id(assignment.gateway_id)

    if gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update assignments for your own gateways"
        )

    # Prepare update data
    update_data = assignment_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )

    # If farm_id is being updated, verify the new farm exists
    if "farm_id" in update_data:
        farm_repo = FarmRepository(db)
        farm = await farm_repo.get_by_id(update_data["farm_id"])
        if not farm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Farm with ID {update_data['farm_id']} not found"
            )

    # Strip timezone info from dates if present (database uses TIMESTAMP WITHOUT TIME ZONE)
    if "start_date" in update_data and update_data["start_date"] and update_data["start_date"].tzinfo:
        update_data["start_date"] = update_data["start_date"].replace(tzinfo=None)
    if "end_date" in update_data and update_data["end_date"] and update_data["end_date"].tzinfo:
        update_data["end_date"] = update_data["end_date"].replace(tzinfo=None)

    try:
        updated_assignment = await assignment_repo.update(assignment_id, **update_data)

        await db.commit()

        logger.info(f"Gateway assignment updated: ID {assignment_id} by user {current_user.username}")
        return GatewayAssignmentResponse.model_validate(updated_assignment)

    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating gateway assignment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update gateway assignment"
        )


@router.delete(
    "/{assignment_id}",
    response_model=MessageResponse,
    summary="Delete Gateway Assignment",
    description="Delete a gateway assignment"
)
async def delete_assignment(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a gateway assignment.

    This action cannot be undone.
    """
    assignment_repo = GatewayAssignmentRepository(db)

    # Check if assignment exists
    assignment = await assignment_repo.get_by_id(assignment_id)

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gateway assignment not found"
        )

    # Verify user owns the gateway
    gateway_repo = GatewayRepository(db)
    gateway = await gateway_repo.get_by_id(assignment.gateway_id)

    if gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete assignments for your own gateways"
        )

    try:
        await assignment_repo.delete(assignment_id)

        await db.commit()

        logger.info(f"Gateway assignment deleted: ID {assignment_id} by user {current_user.username}")

        return MessageResponse(
            message=f"Gateway assignment deleted successfully"
        )

    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting gateway assignment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete gateway assignment"
        )


@router.post(
    "/{assignment_id}/deactivate",
    response_model=GatewayAssignmentResponse,
    summary="Deactivate Gateway Assignment",
    description="Deactivate a gateway assignment"
)
async def deactivate_assignment(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Deactivate a gateway assignment by setting is_active to False and end_date to now.
    """
    assignment_repo = GatewayAssignmentRepository(db)

    # Check if assignment exists
    assignment = await assignment_repo.get_by_id(assignment_id)

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gateway assignment not found"
        )

    # Verify user owns the gateway
    gateway_repo = GatewayRepository(db)
    gateway = await gateway_repo.get_by_id(assignment.gateway_id)

    if gateway.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only deactivate assignments for your own gateways"
        )

    if not assignment.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assignment is already inactive"
        )

    try:
        from datetime import datetime

        updated_assignment = await assignment_repo.update(
            assignment_id,
            is_active=False,
            end_date=datetime.utcnow()
        )

        await db.commit()

        logger.info(f"Gateway assignment deactivated: ID {assignment_id} by user {current_user.username}")
        return GatewayAssignmentResponse.model_validate(updated_assignment)

    except Exception as e:
        await db.rollback()
        logger.error(f"Error deactivating gateway assignment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate gateway assignment"
        )
