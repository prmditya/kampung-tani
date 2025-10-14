"""
Pydantic Schemas for API v1 Request/Response Models
Type-safe, validated data models
"""

from app.api.v1.schemas.base import BaseSchema, MessageResponse, ErrorResponse, PaginatedResponse
from app.api.v1.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserLogin,
    Token,
)
from app.api.v1.schemas.gateway import (
    GatewayCreate,
    GatewayUpdate,
    GatewayResponse,
    GatewayStatus,
)
from app.api.v1.schemas.sensor import (
    SensorCreate,
    SensorUpdate,
    SensorResponse,
    SensorStatus,
)
from app.api.v1.schemas.sensor_data import (
    SensorDataCreate,
    SensorDataResponse,
    SensorDataBulkCreate,
)
from app.api.v1.schemas.health import HealthResponse

__all__ = [
    # Base schemas
    "BaseSchema",
    "MessageResponse",
    "ErrorResponse",
    "PaginatedResponse",
    # User schemas
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserLogin",
    "Token",
    # Gateway schemas
    "GatewayCreate",
    "GatewayUpdate",
    "GatewayResponse",
    "GatewayStatus",
    # Sensor schemas
    "SensorCreate",
    "SensorUpdate",
    "SensorResponse",
    "SensorStatus",
    # Sensor Data schemas
    "SensorDataCreate",
    "SensorDataResponse",
    "SensorDataBulkCreate",
    # Health schemas
    "HealthResponse",
]
