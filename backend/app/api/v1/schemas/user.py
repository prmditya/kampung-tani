"""
User Pydantic Schemas
Authentication and user management schemas
"""

from pydantic import EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

from app.api.v1.schemas.base import BaseSchema


class UserRole(str, Enum):
    """User role enumeration"""

    USER = "user"
    ADMIN = "admin"


class UserBase(BaseSchema):
    """Base user schema"""

    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    role: UserRole = UserRole.ADMIN


class UserCreate(UserBase):
    """User creation schema"""

    password: str = Field(..., min_length=6, max_length=100)


class UserUpdate(BaseSchema):
    """User update schema - all fields optional"""

    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None


class UserResponse(UserBase):
    """User response schema"""

    id: int
    created_at: datetime


class UserLogin(BaseSchema):
    """User login schema"""

    username: str
    password: str


class Token(BaseSchema):
    """JWT token response"""

    access_token: str
    token_type: str = "bearer"
    expires_in: int  # in seconds
    user: UserResponse
