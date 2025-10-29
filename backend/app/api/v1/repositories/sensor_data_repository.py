"""
Sensor Data Repository
Database operations for SensorData model
"""

from typing import Optional, List
from datetime import datetime, timedelta
from sqlalchemy import select, func, and_, desc, or_, cast, String
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.sensor_data import SensorData
from app.models.sensor import Sensor
from app.models.gateway import Gateway
from app.models.gateway_assignment import GatewayAssignment
from app.models.farm import Farm
from app.api.v1.repositories.base_repository import BaseRepository


class SensorDataRepository(BaseRepository[SensorData]):
    """Repository for SensorData model operations"""

    def __init__(self, db: AsyncSession):
        super().__init__(SensorData, db)

    async def get_by_sensor(
        self,
        sensor_id: int,
        skip: int = 0,
        limit: int = 100,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        search: Optional[str] = None,
        farmer_id: Optional[int] = None,
        farm_id: Optional[int] = None
    ) -> List[SensorData]:
        """
        Get sensor data for a specific sensor

        Args:
            sensor_id: Sensor ID
            skip: Number of records to skip
            limit: Maximum number of records
            start_date: Start date filter
            end_date: End date filter
            search: Search term for measurement type, sensor name, or value
            farmer_id: Filter by farmer ID
            farm_id: Filter by farm ID

        Returns:
            List of SensorData instances
        """
        # Determine which joins we need
        need_sensor_join = search is not None
        need_assignment_join = farmer_id is not None or farm_id is not None

        # Build base query
        query = select(SensorData).where(SensorData.sensor_id == sensor_id)

        # Join with Sensor if search is needed
        if need_sensor_join:
            query = query.join(Sensor, SensorData.sensor_id == Sensor.id)

        # Join with GatewayAssignment and Farm if farmer_id or farm_id filter is needed
        if need_assignment_join:
            query = query.join(
                GatewayAssignment,
                and_(
                    SensorData.gateway_id == GatewayAssignment.gateway_id,
                    GatewayAssignment.is_active == True
                )
            ).join(Farm, GatewayAssignment.farm_id == Farm.id)

        # Apply filters
        if start_date:
            query = query.where(SensorData.timestamp >= start_date)

        if end_date:
            query = query.where(SensorData.timestamp <= end_date)

        if search:
            search_term = f"%{search.lower()}%"
            search_filters = []

            # Search in measurement_type from metadata JSONB field (using ->> operator)
            search_filters.append(
                func.lower(
                    func.coalesce(SensorData.metadata_['measurement_type'].astext, '')
                ).like(search_term)
            )

            # Search in sensor name (if not null)
            search_filters.append(
                func.lower(func.coalesce(Sensor.name, '')).like(search_term)
            )

            # Search in sensor_uid
            search_filters.append(
                func.lower(Sensor.sensor_uid).like(search_term)
            )

            # Search in value (convert float to string)
            search_filters.append(
                cast(SensorData.value, String).like(search_term)
            )

            query = query.where(or_(*search_filters))

        if farmer_id is not None:
            query = query.where(Farm.farmer_id == farmer_id)

        if farm_id is not None:
            query = query.where(Farm.id == farm_id)

        query = query.order_by(desc(SensorData.timestamp))
        query = query.offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_gateway(
        self,
        gateway_id: int,
        skip: int = 0,
        limit: int = 100,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[SensorData]:
        """
        Get sensor data for a specific gateway

        Args:
            gateway_id: Gateway ID
            skip: Number of records to skip
            limit: Maximum number of records
            start_date: Start date filter
            end_date: End date filter

        Returns:
            List of SensorData instances
        """
        query = select(SensorData).where(SensorData.gateway_id == gateway_id)

        if start_date:
            query = query.where(SensorData.timestamp >= start_date)

        if end_date:
            query = query.where(SensorData.timestamp <= end_date)

        query = query.order_by(desc(SensorData.timestamp))
        query = query.offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_by_sensor(
        self,
        sensor_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        search: Optional[str] = None,
        farmer_id: Optional[int] = None,
        farm_id: Optional[int] = None
    ) -> int:
        """
        Count sensor data for a sensor

        Args:
            sensor_id: Sensor ID
            start_date: Start date filter
            end_date: End date filter
            search: Search term for measurement type, sensor name, or value
            farmer_id: Filter by farmer ID
            farm_id: Filter by farm ID

        Returns:
            Number of matching records
        """
        # Determine which joins we need
        need_sensor_join = search is not None
        need_assignment_join = farmer_id is not None or farm_id is not None

        # Build base query
        query = select(func.count()).select_from(SensorData).where(SensorData.sensor_id == sensor_id)

        # Join with Sensor if search is needed
        if need_sensor_join:
            query = query.join(Sensor, SensorData.sensor_id == Sensor.id)

        # Join with GatewayAssignment and Farm if farmer_id or farm_id filter is needed
        if need_assignment_join:
            query = query.join(
                GatewayAssignment,
                and_(
                    SensorData.gateway_id == GatewayAssignment.gateway_id,
                    GatewayAssignment.is_active == True
                )
            ).join(Farm, GatewayAssignment.farm_id == Farm.id)

        # Apply filters
        if start_date:
            query = query.where(SensorData.timestamp >= start_date)

        if end_date:
            query = query.where(SensorData.timestamp <= end_date)

        if search:
            search_term = f"%{search.lower()}%"
            search_filters = []

            # Search in measurement_type from metadata JSONB field (using ->> operator)
            search_filters.append(
                func.lower(
                    func.coalesce(SensorData.metadata_['measurement_type'].astext, '')
                ).like(search_term)
            )

            # Search in sensor name (if not null)
            search_filters.append(
                func.lower(func.coalesce(Sensor.name, '')).like(search_term)
            )

            # Search in sensor_uid
            search_filters.append(
                func.lower(Sensor.sensor_uid).like(search_term)
            )

            # Search in value (convert float to string)
            search_filters.append(
                cast(SensorData.value, String).like(search_term)
            )

            query = query.where(or_(*search_filters))

        if farmer_id is not None:
            query = query.where(Farm.farmer_id == farmer_id)

        if farm_id is not None:
            query = query.where(Farm.id == farm_id)

        result = await self.db.execute(query)
        return result.scalar_one()

    async def count_by_gateway(
        self,
        gateway_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> int:
        """
        Count sensor data for a gateway

        Args:
            gateway_id: Gateway ID
            start_date: Start date filter
            end_date: End date filter

        Returns:
            Number of matching records
        """
        query = select(func.count()).select_from(SensorData).where(SensorData.gateway_id == gateway_id)

        if start_date:
            query = query.where(SensorData.timestamp >= start_date)

        if end_date:
            query = query.where(SensorData.timestamp <= end_date)

        result = await self.db.execute(query)
        return result.scalar_one()

    async def get_statistics_by_sensor(
        self,
        sensor_id: int,
        hours: int = 24
    ) -> dict:
        """
        Get statistics for sensor data

        Args:
            sensor_id: Sensor ID
            hours: Hours to look back

        Returns:
            Statistics dict with min, max, avg values
        """
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)

        result = await self.db.execute(
            select(
                func.count(SensorData.id).label("count"),
                func.min(SensorData.value).label("min_value"),
                func.max(SensorData.value).label("max_value"),
                func.avg(SensorData.value).label("avg_value"),
                func.min(SensorData.timestamp).label("first_reading"),
                func.max(SensorData.timestamp).label("last_reading")
            )
            .where(
                and_(
                    SensorData.sensor_id == sensor_id,
                    SensorData.timestamp >= cutoff_time
                )
            )
        )

        row = result.one_or_none()
        if not row or row.count == 0:
            return {
                "count": 0,
                "min_value": None,
                "max_value": None,
                "avg_value": None,
                "first_reading": None,
                "last_reading": None
            }

        return {
            "count": row.count,
            "min_value": float(row.min_value) if row.min_value is not None else None,
            "max_value": float(row.max_value) if row.max_value is not None else None,
            "avg_value": float(row.avg_value) if row.avg_value is not None else None,
            "first_reading": row.first_reading,
            "last_reading": row.last_reading
        }

    async def delete_by_gateway(self, gateway_id: int) -> int:
        """
        Delete all sensor data for a gateway

        Args:
            gateway_id: Gateway ID

        Returns:
            Number of records deleted
        """
        from sqlalchemy import delete as sql_delete

        result = await self.db.execute(
            sql_delete(SensorData).where(SensorData.gateway_id == gateway_id)
        )
        await self.db.flush()
        return result.rowcount

    async def delete_by_sensor(self, sensor_id: int) -> int:
        """
        Delete all sensor data for a sensor

        Args:
            sensor_id: Sensor ID

        Returns:
            Number of records deleted
        """
        from sqlalchemy import delete as sql_delete

        result = await self.db.execute(
            sql_delete(SensorData).where(SensorData.sensor_id == sensor_id)
        )
        await self.db.flush()
        return result.rowcount
