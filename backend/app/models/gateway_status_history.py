"""
Gateway Status History Model
Tracks gateway status changes and uptime
"""

from datetime import datetime
from sqlalchemy import BigInteger, String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.gateway import Gateway


class GatewayStatusHistory(Base):
    """GatewayStatusHistory model for tracking gateway status changes"""

    __tablename__ = "gateway_status_history"

    # Primary Key
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    # Foreign Keys
    gateway_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("gateways.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Status Information
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    uptime_seconds: Mapped[int | None] = mapped_column(BigInteger, nullable=True)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        nullable=False,
        index=True
    )

    # Relationships
    gateway: Mapped["Gateway"] = relationship("Gateway", back_populates="status_history")

    def __repr__(self) -> str:
        return f"<GatewayStatusHistory(id={self.id}, gateway_id={self.gateway_id}, status='{self.status}', uptime_seconds={self.uptime_seconds})>"
