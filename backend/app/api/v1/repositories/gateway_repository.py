"""
Gateway Repository
Database operations for Gateway model
"""

from typing import Optional, List
from datetime import datetime, timedelta
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.gateway import Gateway
from app.models.sensor import Sensor
from app.models.gateway_status_history import GatewayStatusHistory
from app.api.v1.repositories.base_repository import BaseRepository


class GatewayRepository(BaseRepository[Gateway]):
    """Repository for Gateway model operations"""

    def __init__(self, db: AsyncSession):
        super().__init__(Gateway, db)

    async def get_by_uid(self, gateway_uid: str) -> Optional[Gateway]:
        """
        Get gateway by unique identifier

        Args:
            gateway_uid: Gateway UID

        Returns:
            Gateway instance or None
        """
        result = await self.db.execute(
            select(Gateway).where(Gateway.gateway_uid == gateway_uid)
        )
        return result.scalar_one_or_none()

    async def get_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Gateway]:
        """
        Get gateways belonging to a user with filters

        Args:
            user_id: User ID
            skip: Number of records to skip
            limit: Maximum number of records
            status: Filter by status
            search: Search in gateway name or UID

        Returns:
            List of Gateway instances
        """
        query = select(Gateway).where(Gateway.user_id == user_id)

        if status:
            query = query.where(Gateway.status == status)

        if search:
            search_filter = f"%{search}%"
            query = query.where(
                (Gateway.name.ilike(search_filter)) |
                (Gateway.gateway_uid.ilike(search_filter))
            )

        query = query.order_by(Gateway.created_at.desc())
        query = query.offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_by_user(
        self,
        user_id: int,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> int:
        """
        Count gateways for a user with filters

        Args:
            user_id: User ID
            status: Filter by status
            search: Search in gateway name or UID

        Returns:
            Number of matching gateways
        """
        query = select(func.count()).select_from(Gateway).where(Gateway.user_id == user_id)

        if status:
            query = query.where(Gateway.status == status)

        if search:
            search_filter = f"%{search}%"
            query = query.where(
                (Gateway.name.ilike(search_filter)) |
                (Gateway.gateway_uid.ilike(search_filter))
            )

        result = await self.db.execute(query)
        return result.scalar_one()

    async def get_with_sensors(self, gateway_id: int, user_id: int) -> Optional[Gateway]:
        """
        Get gateway with sensors eager loaded

        Args:
            gateway_id: Gateway ID
            user_id: User ID for authorization

        Returns:
            Gateway instance with sensors or None
        """
        result = await self.db.execute(
            select(Gateway)
            .options(selectinload(Gateway.sensors))
            .where(
                and_(
                    Gateway.id == gateway_id,
                    Gateway.user_id == user_id
                )
            )
        )
        return result.scalar_one_or_none()

    async def update_last_seen(self, gateway_id: int, status: str = "online") -> bool:
        """
        Update gateway last_seen timestamp and status

        Args:
            gateway_id: Gateway ID
            status: New status (default: online)

        Returns:
            True if updated successfully
        """
        gateway = await self.get_by_id(gateway_id)
        if not gateway:
            return False

        gateway.last_seen = datetime.utcnow()
        gateway.status = status
        gateway.updated_at = datetime.utcnow()

        await self.db.flush()
        return True

    async def get_status_distribution_by_user(self, user_id: int) -> List[dict]:
        """
        Get gateway status distribution for a user

        Args:
            user_id: User ID

        Returns:
            List of status counts
        """
        result = await self.db.execute(
            select(
                Gateway.status,
                func.count(Gateway.id).label("count")
            )
            .where(Gateway.user_id == user_id)
            .group_by(Gateway.status)
        )
        return [{"status": row.status, "count": row.count} for row in result.all()]

    async def get_offline_gateways(self, minutes: int = 5) -> List[Gateway]:
        """
        Get gateways that should be marked as offline

        Args:
            minutes: Minutes threshold for offline detection

        Returns:
            List of Gateway instances
        """
        threshold_time = datetime.utcnow() - timedelta(minutes=minutes)

        result = await self.db.execute(
            select(Gateway).where(
                and_(
                    Gateway.status == "online",
                    Gateway.last_seen < threshold_time
                )
            )
        )
        return list(result.scalars().all())

    async def gateway_uid_exists(self, gateway_uid: str) -> bool:
        """
        Check if gateway UID already exists

        Args:
            gateway_uid: Gateway UID to check

        Returns:
            True if exists, False otherwise
        """
        return await self.exists(gateway_uid=gateway_uid)
