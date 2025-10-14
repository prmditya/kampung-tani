"""
Gateway Assignment Model
Represents gateway-to-farm assignments
"""

from datetime import datetime
from sqlalchemy import BigInteger, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.gateway import Gateway
    from app.models.farm import Farm
    from app.models.user import User


class GatewayAssignment(Base):
    """GatewayAssignment model for gateway-to-farm relationships"""

    __tablename__ = "gateway_assignments"

    # Primary Key
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    # Foreign Keys
    gateway_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("gateways.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    farm_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("farms.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    assigned_by: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    # Assignment Details
    start_date: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    end_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    gateway: Mapped["Gateway"] = relationship("Gateway", back_populates="gateway_assignments")
    farm: Mapped["Farm"] = relationship("Farm", back_populates="gateway_assignments")
    assigned_by_user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[assigned_by],
        back_populates="gateway_assignments"
    )

    def __repr__(self) -> str:
        return f"<GatewayAssignment(id={self.id}, gateway_id={self.gateway_id}, farm_id={self.farm_id}, is_active={self.is_active})>"
