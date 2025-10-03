"""
Authentication Router
User registration, login, and token management
"""

from fastapi import APIRouter, HTTPException, Depends, status
from datetime import timedelta
from typing import Dict, Any

from app.core.database import get_db_cursor
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)
from app.core.config import get_settings
from app.schemas import (
    UserCreate,
    UserLogin,
    Token,
    UserResponse,
    MessageResponse,
    ErrorResponse
)

router = APIRouter()
settings = get_settings()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New User",
    description="Create a new user account"
)
async def register_user(user_data: UserCreate):
    """
    Register a new user account.
    
    - **username**: Unique username (3-50 characters)
    - **email**: Valid email address
    - **password**: Password (minimum 6 characters)
    - **role**: User role (user/admin, defaults to user)
    """
    
    with get_db_cursor() as cursor:
        # Check if username already exists
        cursor.execute("SELECT id FROM users WHERE username = %s", (user_data.username,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (user_data.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password and create user
        hashed_password = get_password_hash(user_data.password)
        
        cursor.execute(
            """
            INSERT INTO users (username, email, password_hash, role, created_at)
            VALUES (%s, %s, %s, %s, NOW())
            RETURNING id, username, email, role, created_at
            """,
            (user_data.username, user_data.email, hashed_password, user_data.role)
        )
        
        user = cursor.fetchone()
        return UserResponse(**dict(user))


@router.post(
    "/login",
    response_model=Token,
    summary="User Login",
    description="Authenticate user and get access token"
)
async def login_user(credentials: UserLogin):
    """
    Authenticate user and return JWT access token.
    
    - **username**: User's username
    - **password**: User's password
    
    Returns JWT token valid for 7 days.
    """
    
    with get_db_cursor() as cursor:
        # Get user by username
        cursor.execute(
            "SELECT id, username, email, password_hash, role, created_at FROM users WHERE username = %s",
            (credentials.username,)
        )
        user = cursor.fetchone()
        
        if not user or not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token_expires = timedelta(hours=settings.JWT_ACCESS_TOKEN_EXPIRE_HOURS)
        access_token = create_access_token(
            data={"sub": user["username"], "user_id": user["id"]},
            expires_delta=access_token_expires
        )
        
        # Prepare user data for response
        user_response = UserResponse(**{
            k: v for k, v in dict(user).items() 
            if k != "password_hash"
        })
        
        return Token(
            access_token=access_token,
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_HOURS * 3600,  # in seconds
            user=user_response
        )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get Current User",
    description="Get current authenticated user information"
)
async def get_current_user_info(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    Requires valid JWT token in Authorization header.
    """
    return UserResponse(**current_user)


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="User Logout",
    description="Logout current user (client-side token removal)"
)
async def logout_user(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Logout current user.
    
    Note: JWT tokens are stateless. The client should remove the token.
    In a production environment, you might want to implement token blacklisting.
    """
    return MessageResponse(
        message=f"User {current_user['username']} logged out successfully"
    )