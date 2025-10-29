"""
Farmer Model
Represents farm owners
"""

from datetime import datetime
from sqlalchemy import BigInteger, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.farm import Farm


class Farmer(Base):
    """Farmer model representing farm owners"""

    __tablename__ = "farmers"

    # Primary Key
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    # Farmer Information
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    contact: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # Relationships
    farms: Mapped[list["Farm"]] = relationship(
        "Farm",
        back_populates="farmer",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Farmer(id={self.id}, name='{self.name}')>"
