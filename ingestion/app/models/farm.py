from sqlalchemy import Column, BigInteger, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Farm(Base):
    __tablename__ = "farms"

    id = Column(BigInteger, primary_key=True)
    farmer_id = Column(BigInteger, ForeignKey("farmers.id"), nullable=False)
    name = Column(String(100), nullable=False)
    location = Column(String(200))
    latitude = Column(Float)
    longitude = Column(Float)
    area_size = Column(Float)
    soil_type = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    farmer = relationship("Farmer", back_populates="farms")
    assignments = relationship("GatewayAssignment", back_populates="farm")

    def __repr__(self):
        return f"<Farm {self.name}-{self.id}>"
