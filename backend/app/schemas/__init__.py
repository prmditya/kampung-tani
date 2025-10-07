"""
Pydantic Schemas for API Request/Response Models
Type-safe, validated data models
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# Base schemas
class BaseSchema(BaseModel):
    """Base schema with common configuration"""
    model_config = ConfigDict(from_attributes=True)


# User schemas
class UserBase(BaseSchema):
    """Base user schema"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    role: str = Field(default="user", pattern="^(user|admin)$")


class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(..., min_length=6, max_length=100)


class UserUpdate(BaseSchema):
    """User update schema"""
    email: Optional[EmailStr] = None
    role: Optional[str] = Field(None, pattern="^(user|admin)$")


class UserResponse(UserBase):
    """User response schema"""
    id: int
    created_at: datetime


class UserLogin(BaseSchema):
    """User login schema"""
    username: str
    password: str


# Token schemas
class Token(BaseSchema):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


# Device schemas
class DeviceStatus(str, Enum):
    """Device status enumeration"""
    ONLINE = "online"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"


class DeviceBase(BaseSchema):
    """Base device schema"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=200)
    device_type: str = Field(..., max_length=50)
    status: DeviceStatus = DeviceStatus.OFFLINE


class DeviceCreate(DeviceBase):
    """Device creation schema"""
    pass


class DeviceUpdate(BaseSchema):
    """Device update schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=200)
    device_type: Optional[str] = Field(None, max_length=50)
    status: Optional[DeviceStatus] = None


class DeviceResponse(DeviceBase):
    """Device response schema"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


# Sensor data schemas
class SensorDataBase(BaseSchema):
    """Base sensor data schema"""
    sensor_type: str = Field(..., max_length=50)
    value: float
    unit: Optional[str] = Field(None, max_length=20)
    metadata: Optional[Dict[str, Any]] = None


class SensorDataCreate(SensorDataBase):
    """Sensor data creation schema"""
    device_id: int


class SensorDataResponse(SensorDataBase):
    """Sensor data response schema"""
    id: int
    device_id: int
    timestamp: datetime


# Pagination schemas
class PaginationParams(BaseSchema):
    """Pagination parameters"""
    page: int = Field(default=1, ge=1)
    size: int = Field(default=20, ge=1, le=100)


class PaginatedResponse(BaseSchema):
    """Paginated response wrapper"""
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int


# API Response schemas
class MessageResponse(BaseSchema):
    """Simple message response"""
    message: str
    success: bool = True


class ErrorResponse(BaseSchema):
    """Error response schema"""
    error: str
    detail: Optional[str] = None
    success: bool = False


# Health check schema
class HealthResponse(BaseSchema):
    """Health check response"""
    status: str
    timestamp: datetime
    version: str
    database: bool
    services: Dict[str, bool]