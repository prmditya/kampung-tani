"""
Gateway Model
Represents IoT gateway devices
"""

from datetime import datetime
from sqlalchemy import BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.sensor import Sensor
    from app.models.sensor_data import SensorData
    from app.models.gateway_assignment import GatewayAssignment
    from app.models.gateway_status_history import GatewayStatusHistory


class Gateway(Base):
    """Gateway model representing IoT gateway devices"""

    __tablename__ = "gateways"

    # Primary Key
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    # Foreign Keys
    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Gateway Information
    gateway_uid: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )
    name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    mac_address: Mapped[str | None] = mapped_column(String(50), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20),
        default="offline",
        nullable=False,
        index=True
    )
    last_seen: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="gateways")

    sensors: Mapped[list["Sensor"]] = relationship(
        "Sensor",
        back_populates="gateway",
        cascade="all, delete-orphan"
    )

    sensor_data: Mapped[list["SensorData"]] = relationship(
        "SensorData",
        back_populates="gateway",
        cascade="all, delete-orphan"
    )

    gateway_assignments: Mapped[list["GatewayAssignment"]] = relationship(
        "GatewayAssignment",
        back_populates="gateway",
        cascade="all, delete-orphan"
    )

    status_history: Mapped[list["GatewayStatusHistory"]] = relationship(
        "GatewayStatusHistory",
        back_populates="gateway",
        cascade="all, delete-orphan",
        order_by="GatewayStatusHistory.created_at.desc()"
    )

    def __repr__(self) -> str:
        return f"<Gateway(id={self.id}, gateway_uid='{self.gateway_uid}', status='{self.status}')>"
