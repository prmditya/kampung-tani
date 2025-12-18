"""
Base Pydantic Schemas
Common schemas used across the API
"""

from pydantic import BaseModel, ConfigDict
from typing import Generic, TypeVar, List, Any, Optional


class BaseSchema(BaseModel):
    """Base schema with common configuration"""

    model_config = ConfigDict(from_attributes=True)


T = TypeVar("T")


class PaginatedResponse(BaseSchema, Generic[T]):
    """Generic paginated response wrapper"""

    items: List[T]
    total: int
    page: int
    size: int
    pages: int


class MessageResponse(BaseSchema):
    """Simple message response"""

    message: str
    success: bool = True


class ErrorResponse(BaseSchema):
    """Error response schema"""

    error: str
    detail: Optional[str] = None
    success: bool = False
