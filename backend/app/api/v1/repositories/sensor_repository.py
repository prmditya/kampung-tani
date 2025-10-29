"""
Sensor Repository
Database operations for Sensor model
"""

from typing import Optional, List
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.sensor import Sensor
from app.api.v1.repositories.base_repository import BaseRepository


class SensorRepository(BaseRepository[Sensor]):
    """Repository for Sensor model operations"""

    def __init__(self, db: AsyncSession):
        super().__init__(Sensor, db)

    async def get_by_uid(self, sensor_uid: str) -> Optional[Sensor]:
        """
        Get sensor by unique identifier

        Args:
            sensor_uid: Sensor UID

        Returns:
            Sensor instance or None
        """
        result = await self.db.execute(
            select(Sensor).where(Sensor.sensor_uid == sensor_uid)
        )
        return result.scalar_one_or_none()

    async def get_by_gateway(
        self,
        gateway_id: int,
        skip: int = 0,
        limit: int = 100,
        sensor_type: Optional[str] = None
    ) -> List[Sensor]:
        """
        Get sensors for a specific gateway

        Args:
            gateway_id: Gateway ID
            skip: Number of records to skip
            limit: Maximum number of records
            sensor_type: Filter by sensor type

        Returns:
            List of Sensor instances
        """
        query = select(Sensor).where(Sensor.gateway_id == gateway_id)

        if sensor_type:
            query = query.where(Sensor.type == sensor_type)

        query = query.order_by(Sensor.created_at.desc())
        query = query.offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_by_gateway(
        self,
        gateway_id: int,
        sensor_type: Optional[str] = None
    ) -> int:
        """
        Count sensors for a gateway

        Args:
            gateway_id: Gateway ID
            sensor_type: Filter by sensor type

        Returns:
            Number of matching sensors
        """
        query = select(func.count()).select_from(Sensor).where(Sensor.gateway_id == gateway_id)

        if sensor_type:
            query = query.where(Sensor.type == sensor_type)

        result = await self.db.execute(query)
        return result.scalar_one()

    async def sensor_uid_exists(self, sensor_uid: str) -> bool:
        """
        Check if sensor UID already exists

        Args:
            sensor_uid: Sensor UID to check

        Returns:
            True if exists, False otherwise
        """
        return await self.exists(sensor_uid=sensor_uid)

    async def get_with_sensor_data(self, sensor_id: int) -> Optional[Sensor]:
        """
        Get sensor with sensor data eager loaded

        Args:
            sensor_id: Sensor ID

        Returns:
            Sensor instance with sensor data or None
        """
        result = await self.db.execute(
            select(Sensor)
            .options(selectinload(Sensor.sensor_data))
            .where(Sensor.id == sensor_id)
        )
        return result.scalar_one_or_none()

    async def delete(self, id: int) -> bool:
        """
        Delete a sensor by ID with cascade delete of associated sensor data

        Override base repository delete to properly trigger ORM cascade

        Args:
            id: Sensor ID

        Returns:
            True if deleted, False if not found
        """
        # Load sensor with sensor data to trigger ORM cascade
        sensor = await self.get_with_sensor_data(id)

        if not sensor:
            return False

        # Delete through session to trigger cascade
        await self.db.delete(sensor)
        await self.db.flush()

        return True
