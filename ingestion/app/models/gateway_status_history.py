from sqlalchemy import Column, BigInteger, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class GatewayStatusHistory(Base):
    __tablename__ = "gateway_status_history"

    id = Column(BigInteger, primary_key=True)
    gateway_id = Column(BigInteger, ForeignKey("gateways.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(20), nullable=False)
    uptime_seconds = Column(BigInteger, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    gateway = relationship("Gateway", back_populates="status_history")

    def __repr__(self):
        return f"<GatewayStatusHistory(id={self.id}, gateway_id={self.gateway_id}, status='{self.status}', uptime_seconds={self.uptime_seconds})>"
