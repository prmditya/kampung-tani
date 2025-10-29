from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(BigInteger, primary_key=True)
    gateway_id = Column(BigInteger, ForeignKey("gateways.id"), nullable=False)
    sensor_uid = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(100))
    type = Column(String(50), nullable=False)
    status = Column(String(20), default="inactive")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    gateway = relationship("Gateway", back_populates="sensors")
    sensor_data = relationship("SensorData", back_populates="sensor")

    def __repr__(self):
        return f"<Sensor {self.sensor_uid}>"
