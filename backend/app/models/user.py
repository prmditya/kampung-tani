"""
User Model
Handles user authentication and authorization
"""

from datetime import datetime
from sqlalchemy import BigInteger, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.gateway import Gateway
    from app.models.gateway_assignment import GatewayAssignment


class User(Base):
    """User model for authentication and authorization"""

    __tablename__ = "users"

    # Primary Key
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    # User Information
    username: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    email: Mapped[str] = mapped_column(
        String(150), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="admin", nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    gateways: Mapped[list["Gateway"]] = relationship(
        "Gateway", back_populates="user", cascade="all, delete-orphan"
    )

    gateway_assignments: Mapped[list["GatewayAssignment"]] = relationship(
        "GatewayAssignment",
        foreign_keys="GatewayAssignment.assigned_by",
        back_populates="assigned_by_user",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"
