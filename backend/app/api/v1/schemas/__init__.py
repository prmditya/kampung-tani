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
from app.api.v1.schemas.farmer import (
    FarmerCreate,
    FarmerUpdate,
    FarmerResponse,
)
from app.api.v1.schemas.farm import (
    FarmCreate,
    FarmUpdate,
    FarmResponse,
)
from app.api.v1.schemas.gateway_assignment import (
    GatewayAssignmentCreate,
    GatewayAssignmentUpdate,
    GatewayAssignmentResponse,
)
from app.api.v1.schemas.gateway_status_history import (
    GatewayStatusHistoryCreate,
    GatewayStatusHistoryResponse,
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
    # Farmer schemas
    "FarmerCreate",
    "FarmerUpdate",
    "FarmerResponse",
    # Farm schemas
    "FarmCreate",
    "FarmUpdate",
    "FarmResponse",
    # Gateway Assignment schemas
    "GatewayAssignmentCreate",
    "GatewayAssignmentUpdate",
    "GatewayAssignmentResponse",
    # Gateway Status History schemas
    "GatewayStatusHistoryCreate",
    "GatewayStatusHistoryResponse",
    # Health schemas
    "HealthResponse",
]
