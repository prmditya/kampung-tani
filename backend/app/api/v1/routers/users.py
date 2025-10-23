"""
User Management Router
Admin user CRUD operations (Super Admin only)
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import logging

from app.core.database import get_db
from app.core.security import (
    get_current_super_admin_user,
    get_password_hash,
)
from app.models.user import User
from app.api.v1.repositories.user_repository import UserRepository
from app.api.v1.schemas import (
    UserResponse,
    UserCreate,
    UserUpdate,
    MessageResponse,
    UserRole,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "",
    response_model=List[UserResponse],
    summary="Get All Users",
    description="Retrieve all users (Super Admin only)",
)
async def get_all_users(
    role: Optional[UserRole] = None,
    current_user: User = Depends(get_current_super_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all users in the system.

    - **role**: Optional filter by role (admin, super admin)

    Only accessible by super admins.
    """
    user_repo = UserRepository(db)

    try:
        if role:
            # Filter by role if provided
            users = await user_repo.get_all()
            users = [u for u in users if u.role == role.value]
        else:
            users = await user_repo.get_all()

        return [UserResponse.model_validate(user) for user in users]

    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users"
        )


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get User by ID",
    description="Retrieve a specific user by ID (Super Admin only)",
)
async def get_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_super_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a specific user by ID.

    - **user_id**: User ID to retrieve

    Only accessible by super admins.
    """
    user_repo = UserRepository(db)

    user = await user_repo.get_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )

    return UserResponse.model_validate(user)


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New User",
    description="Create a new admin user (Super Admin only)",
)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_super_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new user account.

    - **username**: Unique username (3-50 characters)
    - **email**: Valid email address
    - **password**: Password (minimum 6 characters)
    - **role**: User role (admin, super admin)

    Only accessible by super admins.
    """
    user_repo = UserRepository(db)

    # Check if username already exists
    if await user_repo.username_exists(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Check if email already exists
    if await user_repo.email_exists(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)

    try:
        user = await user_repo.create(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_password,
            role=user_data.role.value
        )

        logger.info(f"User created by {current_user.username}: {user.username}")
        return UserResponse.model_validate(user)

    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update User",
    description="Update user information (Super Admin only)",
)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_super_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update user information.

    - **user_id**: User ID to update
    - **email**: Optional new email address
    - **role**: Optional new role

    Only accessible by super admins.
    """
    user_repo = UserRepository(db)

    # Get existing user
    user = await user_repo.get_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )

    # Prevent super admin from downgrading themselves
    if user.id == current_user.id and user_data.role and user_data.role.value != "super admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot downgrade your own role"
        )

    # Check if new email already exists
    if user_data.email and user_data.email != user.email:
        if await user_repo.email_exists(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    # Prepare update data
    update_data = {}
    if user_data.email:
        update_data["email"] = user_data.email
    if user_data.role:
        update_data["role"] = user_data.role.value

    try:
        updated_user = await user_repo.update(user_id, **update_data)

        logger.info(f"User updated by {current_user.username}: {updated_user.username}")
        return UserResponse.model_validate(updated_user)

    except Exception as e:
        logger.error(f"Error updating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )


@router.delete(
    "/{user_id}",
    response_model=MessageResponse,
    summary="Delete User",
    description="Delete a user (Super Admin only)",
)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_super_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a user from the system.

    - **user_id**: User ID to delete

    Cannot delete:
    - Yourself
    - Other super admins

    Only accessible by super admins.
    """
    user_repo = UserRepository(db)

    # Get user to delete
    user = await user_repo.get_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )

    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    # Prevent deleting other super admins
    if user.role == "super admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete super admin users"
        )

    try:
        await user_repo.delete(user_id)

        logger.info(f"User deleted by {current_user.username}: {user.username}")
        return MessageResponse(
            message=f"User {user.username} deleted successfully"
        )

    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )
