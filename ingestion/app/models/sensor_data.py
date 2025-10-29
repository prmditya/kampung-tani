from sqlalchemy import Column, BigInteger, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(BigInteger, primary_key=True)
    sensor_id = Column(BigInteger, ForeignKey("sensors.id"), nullable=False)
    gateway_id = Column(BigInteger, ForeignKey("gateways.id"), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(20))
    # 'metadata' is a reserved attribute name on Declarative Base, so expose it
    # on the DB as the column name but use a different Python attribute.
    metadata_ = Column("metadata", JSONB)  # Store extra info
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    sensor = relationship("Sensor", back_populates="sensor_data")
    gateway = relationship("Gateway", back_populates="sensor_data")

    def __repr__(self):
        return f"<SensorData {self.sensor_id}: {self.value} {self.unit}>"
