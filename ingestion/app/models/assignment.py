from sqlalchemy import Column, BigInteger, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class GatewayAssignment(Base):
    __tablename__ = "gateway_assignments"

    id = Column(BigInteger, primary_key=True)
    gateway_id = Column(BigInteger, ForeignKey("gateways.id"), nullable=False)
    farm_id = Column(BigInteger, ForeignKey("farms.id"), nullable=False)
    # Note: DB schema does not include a 'name' column, so we don't define it here.
    assigned_by = Column(BigInteger, ForeignKey("users.id"))
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)

    # Relationships
    farm = relationship("Farm", back_populates="assignments")
    gateway = relationship("Gateway", back_populates="assignments")

    def __repr__(self):
        return f"<GatewayAssignment id={self.id} gateway={self.gateway_id} farm={self.farm_id}>"
