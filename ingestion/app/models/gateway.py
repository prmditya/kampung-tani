from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Gateway(Base):
    __tablename__ = "gateways"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    gateway_uid = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(100))
    mac_address = Column(String(50))
    description = Column(Text)
    status = Column(String(20), default="offline")
    last_seen = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    sensors = relationship("Sensor", back_populates="gateway")
    sensor_data = relationship("SensorData", back_populates="gateway")
    assignments = relationship("GatewayAssignment", back_populates="gateway")
    assignments = relationship("GatewayAssignment", back_populates="gateway")

    def __repr__(self):
        return f"<Gateway {self.gateway_uid}>"
