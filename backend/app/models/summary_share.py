"""
Summary Share Model
Represents shareable summary report links for farmers
"""

import uuid
from datetime import datetime, timedelta
from sqlalchemy import BigInteger, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.farm import Farm
    from app.models.user import User


def generate_token() -> str:
    """Generate a unique 32-character token"""
    return uuid.uuid4().hex


class SummaryShare(Base):
    """Summary Share model for shareable report links"""

    __tablename__ = "summary_shares"

    # Primary Key
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    # Unique Token for URL
    token: Mapped[str] = mapped_column(
        String(32),
        unique=True,
        nullable=False,
        default=generate_token,
        index=True
    )

    # Foreign Keys
    farm_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("farms.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    created_by: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Date filters (optional)
    start_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.utcnow() + timedelta(days=30),
        nullable=False
    )

    # Relationships
    farm: Mapped["Farm"] = relationship("Farm", lazy="joined")
    creator: Mapped["User"] = relationship("User", lazy="joined")

    @property
    def is_expired(self) -> bool:
        """Check if the share link has expired"""
        return datetime.utcnow() > self.expires_at

    @property
    def is_valid(self) -> bool:
        """Check if the share link is valid (active and not expired)"""
        return self.is_active and not self.is_expired

    def __repr__(self) -> str:
        return f"<SummaryShare(id={self.id}, token='{self.token[:8]}...', farm_id={self.farm_id})>"
