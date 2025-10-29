"""
Farm Model
Represents agricultural farms
"""

from datetime import datetime
from sqlalchemy import BigInteger, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.farmer import Farmer
    from app.models.gateway_assignment import GatewayAssignment


class Farm(Base):
    """Farm model representing agricultural lands"""

    __tablename__ = "farms"

    # Primary Key
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    # Foreign Keys
    farmer_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("farmers.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Farm Information
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    area_size: Mapped[float | None] = mapped_column(Float, nullable=True)
    soil_type: Mapped[str | None] = mapped_column(String(50), nullable=True)

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
    farmer: Mapped["Farmer"] = relationship("Farmer", back_populates="farms")

    gateway_assignments: Mapped[list["GatewayAssignment"]] = relationship(
        "GatewayAssignment",
        back_populates="farm",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Farm(id={self.id}, name='{self.name}', farmer_id={self.farmer_id})>"
