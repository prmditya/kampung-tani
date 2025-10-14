"""
Gateway Status History Repository
Database operations for GatewayStatusHistory model
"""

from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gateway_status_history import GatewayStatusHistory
from app.api.v1.repositories.base_repository import BaseRepository


class GatewayStatusHistoryRepository(BaseRepository[GatewayStatusHistory]):
    """Repository for GatewayStatusHistory model operations"""

    def __init__(self, db: AsyncSession):
        super().__init__(GatewayStatusHistory, db)

    async def get_by_gateway(
        self,
        gateway_id: int,
        skip: int = 0,
        limit: int = 100,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[GatewayStatusHistory]:
        """
        Get status history for a specific gateway

        Args:
            gateway_id: Gateway ID
            skip: Number of records to skip
            limit: Maximum number of records
            start_date: Filter records after this date
            end_date: Filter records before this date

        Returns:
            List of GatewayStatusHistory instances
        """
        query = select(GatewayStatusHistory).where(
            GatewayStatusHistory.gateway_id == gateway_id
        )

        if start_date:
            query = query.where(GatewayStatusHistory.created_at >= start_date)

        if end_date:
            query = query.where(GatewayStatusHistory.created_at <= end_date)

        query = query.order_by(
            GatewayStatusHistory.created_at.desc()
        ).offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_by_gateway(
        self,
        gateway_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> int:
        """
        Count status history records for a gateway

        Args:
            gateway_id: Gateway ID
            start_date: Filter records after this date
            end_date: Filter records before this date

        Returns:
            Number of history records
        """
        query = select(func.count()).select_from(GatewayStatusHistory).where(
            GatewayStatusHistory.gateway_id == gateway_id
        )

        if start_date:
            query = query.where(GatewayStatusHistory.created_at >= start_date)

        if end_date:
            query = query.where(GatewayStatusHistory.created_at <= end_date)

        result = await self.db.execute(query)
        return result.scalar_one()

    async def get_latest_by_gateway(self, gateway_id: int) -> Optional[GatewayStatusHistory]:
        """
        Get the most recent status history entry for a gateway

        Args:
            gateway_id: Gateway ID

        Returns:
            Latest GatewayStatusHistory instance or None
        """
        result = await self.db.execute(
            select(GatewayStatusHistory)
            .where(GatewayStatusHistory.gateway_id == gateway_id)
            .order_by(GatewayStatusHistory.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_status_changes_by_gateway(
        self,
        gateway_id: int,
        hours: int = 24
    ) -> List[GatewayStatusHistory]:
        """
        Get status changes for a gateway in the last N hours

        Args:
            gateway_id: Gateway ID
            hours: Number of hours to look back

        Returns:
            List of GatewayStatusHistory instances
        """
        threshold_time = datetime.utcnow() - timedelta(hours=hours)

        result = await self.db.execute(
            select(GatewayStatusHistory)
            .where(
                and_(
                    GatewayStatusHistory.gateway_id == gateway_id,
                    GatewayStatusHistory.created_at >= threshold_time
                )
            )
            .order_by(GatewayStatusHistory.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_uptime_statistics(
        self,
        gateway_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> dict:
        """
        Get uptime statistics for a gateway

        Args:
            gateway_id: Gateway ID
            start_date: Filter records after this date
            end_date: Filter records before this date

        Returns:
            Dictionary with uptime statistics
        """
        query = select(
            func.count(GatewayStatusHistory.id).label("total_records"),
            func.avg(GatewayStatusHistory.uptime_seconds).label("avg_uptime"),
            func.max(GatewayStatusHistory.uptime_seconds).label("max_uptime"),
            func.min(GatewayStatusHistory.uptime_seconds).label("min_uptime")
        ).where(
            and_(
                GatewayStatusHistory.gateway_id == gateway_id,
                GatewayStatusHistory.uptime_seconds.isnot(None)
            )
        )

        if start_date:
            query = query.where(GatewayStatusHistory.created_at >= start_date)

        if end_date:
            query = query.where(GatewayStatusHistory.created_at <= end_date)

        result = await self.db.execute(query)
        row = result.first()

        return {
            "total_records": row.total_records if row else 0,
            "avg_uptime_seconds": float(row.avg_uptime) if row and row.avg_uptime else 0,
            "max_uptime_seconds": row.max_uptime if row else 0,
            "min_uptime_seconds": row.min_uptime if row else 0
        }

    async def get_status_distribution(
        self,
        gateway_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[dict]:
        """
        Get status distribution for a gateway

        Args:
            gateway_id: Gateway ID
            start_date: Filter records after this date
            end_date: Filter records before this date

        Returns:
            List of status counts
        """
        query = select(
            GatewayStatusHistory.status,
            func.count(GatewayStatusHistory.id).label("count")
        ).where(GatewayStatusHistory.gateway_id == gateway_id)

        if start_date:
            query = query.where(GatewayStatusHistory.created_at >= start_date)

        if end_date:
            query = query.where(GatewayStatusHistory.created_at <= end_date)

        query = query.group_by(GatewayStatusHistory.status)

        result = await self.db.execute(query)
        return [{"status": row.status, "count": row.count} for row in result.all()]
