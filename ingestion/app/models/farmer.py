from sqlalchemy import Column, BigInteger, String, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(BigInteger, primary_key=True)
    name = Column(String(100), nullable=False)
    contact = Column(String(50))
    address = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    farms = relationship("Farm", back_populates="farmer")

    def __repr__(self):
        return f"<Farmer {self.name}-{self.id}>"
