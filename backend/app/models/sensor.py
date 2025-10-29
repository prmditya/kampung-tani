"""
Sensor Model
Represents individual sensors attached to gateways
"""

from datetime import datetime
from sqlalchemy import BigInteger, String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.gateway import Gateway
    from app.models.sensor_data import SensorData


class Sensor(Base):
    """Sensor model representing individual IoT sensors"""

    __tablename__ = "sensors"

    # Primary Key
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    # Foreign Keys
    gateway_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("gateways.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Sensor Information
    sensor_uid: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )
    name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        default="inactive",
        nullable=False
    )

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
    gateway: Mapped["Gateway"] = relationship("Gateway", back_populates="sensors")

    sensor_data: Mapped[list["SensorData"]] = relationship(
        "SensorData",
        back_populates="sensor",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Sensor(id={self.id}, sensor_uid='{self.sensor_uid}', type='{self.type}')>"
