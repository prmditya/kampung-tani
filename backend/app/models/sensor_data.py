"""
Sensor Data Model
Represents time-series sensor readings
"""

from datetime import datetime
from sqlalchemy import BigInteger, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from typing import TYPE_CHECKING, Any, Optional

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.sensor import Sensor
    from app.models.gateway import Gateway
    from app.models.farm import Farm
    from app.models.user import User


class SensorData(Base):
    """SensorData model for time-series sensor readings"""

    __tablename__ = "sensor_data"

    # Primary Key
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    # Foreign Keys
    sensor_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("sensors.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    gateway_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("gateways.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Historical Assignment Snapshot (nullable for backwards compatibility)
    farm_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("farms.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Snapshot of farm assignment at the time data was received"
    )
    assigned_by: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Snapshot of user who assigned gateway at the time data was received"
    )

    # Sensor Data
    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    metadata_: Mapped[dict[str, Any] | None] = mapped_column("metadata", JSONB, nullable=True)

    # Timestamp
    timestamp: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True
    )

    # Relationships
    sensor: Mapped["Sensor"] = relationship("Sensor", back_populates="sensor_data")
    gateway: Mapped["Gateway"] = relationship("Gateway", back_populates="sensor_data")
    farm: Mapped[Optional["Farm"]] = relationship("Farm", foreign_keys=[farm_id])
    assigned_by_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assigned_by])

    def __repr__(self) -> str:
        return f"<SensorData(id={self.id}, sensor_id={self.sensor_id}, value={self.value}, timestamp={self.timestamp})>"
