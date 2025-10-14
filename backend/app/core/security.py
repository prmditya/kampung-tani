"""
Async FastAPI Security and Authentication
JWT-based authentication with modern best practices and async SQLAlchemy
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
import bcrypt
import logging

from app.core.config import get_settings
from app.core.database import get_db
from app.models.user import User
from app.api.v1.repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)
settings = get_settings()

# JWT token bearer
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its hash using bcrypt

    Args:
        plain_password: Plain text password
        hashed_password: Bcrypt hashed password

    Returns:
        True if password matches, False otherwise
    """
    try:
        # Truncate password if too long (bcrypt limitation)
        if len(plain_password) > 72:
            plain_password = plain_password[:72]

        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


def get_password_hash(password: str) -> str:
    """
    Generate password hash using bcrypt

    Args:
        password: Plain text password

    Returns:
        Bcrypt hashed password
    """
    # Truncate password if too long (bcrypt limitation)
    if len(password) > 72:
        password = password[:72]

    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def create_access_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create JWT access token

    Args:
        data: Token payload data
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            hours=settings.JWT_ACCESS_TOKEN_EXPIRE_HOURS
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify and decode JWT token

    Args:
        token: JWT token string

    Returns:
        Decoded token payload

    Raises:
        HTTPException: If token is invalid
    """
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_user_from_token(token: str, db: AsyncSession) -> Optional[User]:
    """
    Get user from JWT token using async database

    Args:
        token: JWT token string
        db: Database session

    Returns:
        User instance or None if not found
    """
    try:
        payload = verify_token(token)
        user_id: int = payload.get("user_id")
        username: str = payload.get("sub")

        if user_id is None or username is None:
            return None

        # Get user from database using repository
        user_repo = UserRepository(db)
        user = await user_repo.get_by_id(user_id)

        if user and user.username == username:
            return user

        return None

    except Exception as e:
        logger.error(f"Error getting user from token: {e}")
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    FastAPI dependency to get current authenticated user

    Args:
        credentials: Bearer token credentials
        db: Database session

    Returns:
        Current User instance

    Raises:
        HTTPException: If authentication fails
    """
    user = await get_user_from_token(credentials.credentials, db)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    FastAPI dependency to get current admin user

    Args:
        current_user: Current authenticated user

    Returns:
        Current User instance (admin only)

    Raises:
        HTTPException: If user is not admin
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Admin access required."
        )

    return current_user
