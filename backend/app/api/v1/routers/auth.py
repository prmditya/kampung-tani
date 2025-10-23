"""
Authentication Router
User registration, login, and token management with async SQLAlchemy
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
import logging

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
)
from app.core.config import get_settings
from app.models.user import User
from app.api.v1.repositories.user_repository import UserRepository
from app.api.v1.schemas import (
    UserCreate,
    UserUpdate,
    UserLogin,
    Token,
    UserResponse,
    MessageResponse,
    PasswordChange,
)

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New User",
    description="Create a new user account with username, email and password",
)
async def register_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user account.

    - **username**: Unique username (3-50 characters)
    - **email**: Valid email address
    - **password**: Password (minimum 6 characters)
    - **role**: User role (user/admin, defaults to admin)
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

        logger.info(f"User created successfully: {user.username}")
        return UserResponse.model_validate(user)

    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )


@router.post(
    "/login",
    response_model=Token,
    summary="User Login",
    description="Authenticate user and get JWT access token",
)
async def login_user(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user and return JWT access token.

    - **username**: User's username
    - **password**: User's password

    Returns JWT token valid for configured hours (default: 24 hours).
    """
    user_repo = UserRepository(db)

    # Get user by username
    user = await user_repo.get_by_username(credentials.username)

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(hours=settings.JWT_ACCESS_TOKEN_EXPIRE_HOURS)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=access_token_expires,
    )

    logger.info(f"User logged in successfully: {user.username}")

    return Token(
        access_token=access_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_HOURS * 3600,  # in seconds
        user=UserResponse.model_validate(user)
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get Current User",
    description="Get current authenticated user information",
)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    """
    Get current authenticated user information.

    Requires valid JWT token in Authorization header.
    """
    return UserResponse.model_validate(current_user)


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="User Logout",
    description="Logout current user (client-side token removal)",
)
async def logout_user(
    current_user: User = Depends(get_current_user)
):
    """
    Logout current user.

    Note: JWT tokens are stateless. The client should remove the token.
    In a production environment, you might want to implement token blacklisting.
    """
    logger.info(f"User logged out: {current_user.username}")

    return MessageResponse(
        message=f"User {current_user.username} logged out successfully"
    )


@router.put(
    "/me",
    response_model=UserResponse,
    summary="Update Own Profile",
    description="Update current user's profile information",
)
async def update_own_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update current authenticated user's profile.

    Users can update their own:
    - Email address

    Requires valid JWT token in Authorization header.
    """
    user_repo = UserRepository(db)

    # Check if new email already exists (if email is being changed)
    if user_data.email and user_data.email != current_user.email:
        if await user_repo.email_exists(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    # Prepare update data (only email, users cannot change their own role)
    update_data = {}
    if user_data.email:
        update_data["email"] = user_data.email

    try:
        updated_user = await user_repo.update(current_user.id, **update_data)

        logger.info(f"User updated own profile: {updated_user.username}")
        return UserResponse.model_validate(updated_user)

    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@router.post(
    "/change-password",
    response_model=MessageResponse,
    summary="Change Password",
    description="Change current user's password",
)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Change current authenticated user's password.

    Requires:
    - Current password (for verification)
    - New password (minimum 6 characters)

    Requires valid JWT token in Authorization header.
    """
    user_repo = UserRepository(db)

    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Check if new password is same as current password
    if verify_password(password_data.new_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password"
        )

    # Hash new password and update
    new_password_hash = get_password_hash(password_data.new_password)

    try:
        await user_repo.update(current_user.id, password_hash=new_password_hash)

        logger.info(f"User changed password: {current_user.username}")
        return MessageResponse(
            message="Password changed successfully"
        )

    except Exception as e:
        logger.error(f"Error changing password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )
