"""
Gateway Assignment Repository
Database operations for GatewayAssignment model
"""

from typing import Optional, List
from datetime import datetime
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.gateway_assignment import GatewayAssignment
from app.models.gateway import Gateway
from app.models.farm import Farm
from app.api.v1.repositories.base_repository import BaseRepository


class GatewayAssignmentRepository(BaseRepository[GatewayAssignment]):
    """Repository for GatewayAssignment model operations"""

    def __init__(self, db: AsyncSession):
        super().__init__(GatewayAssignment, db)

    async def get_by_gateway(
        self,
        gateway_id: int,
        active_only: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> List[GatewayAssignment]:
        """
        Get assignments for a specific gateway

        Args:
            gateway_id: Gateway ID
            active_only: Only return active assignments
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            List of GatewayAssignment instances
        """
        query = select(GatewayAssignment).where(GatewayAssignment.gateway_id == gateway_id)

        if active_only:
            query = query.where(GatewayAssignment.is_active == True)

        query = query.order_by(GatewayAssignment.start_date.desc()).offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_farm(
        self,
        farm_id: int,
        active_only: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> List[GatewayAssignment]:
        """
        Get assignments for a specific farm

        Args:
            farm_id: Farm ID
            active_only: Only return active assignments
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            List of GatewayAssignment instances
        """
        query = select(GatewayAssignment).where(GatewayAssignment.farm_id == farm_id)

        if active_only:
            query = query.where(GatewayAssignment.is_active == True)

        query = query.order_by(GatewayAssignment.start_date.desc()).offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_active_assignment_for_gateway(
        self,
        gateway_id: int
    ) -> Optional[GatewayAssignment]:
        """
        Get the current active assignment for a gateway

        Args:
            gateway_id: Gateway ID

        Returns:
            Active GatewayAssignment instance or None
        """
        result = await self.db.execute(
            select(GatewayAssignment)
            .where(
                and_(
                    GatewayAssignment.gateway_id == gateway_id,
                    GatewayAssignment.is_active == True
                )
            )
            .order_by(GatewayAssignment.start_date.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def deactivate_gateway_assignments(self, gateway_id: int) -> int:
        """
        Deactivate all active assignments for a gateway

        Args:
            gateway_id: Gateway ID

        Returns:
            Number of assignments deactivated
        """
        from sqlalchemy import update

        result = await self.db.execute(
            update(GatewayAssignment)
            .where(
                and_(
                    GatewayAssignment.gateway_id == gateway_id,
                    GatewayAssignment.is_active == True
                )
            )
            .values(is_active=False, end_date=datetime.utcnow())
        )
        await self.db.flush()
        return result.rowcount

    async def count_by_gateway(self, gateway_id: int, active_only: bool = False) -> int:
        """
        Count assignments for a gateway

        Args:
            gateway_id: Gateway ID
            active_only: Only count active assignments

        Returns:
            Number of assignments
        """
        from sqlalchemy import func

        query = select(func.count()).select_from(GatewayAssignment).where(
            GatewayAssignment.gateway_id == gateway_id
        )

        if active_only:
            query = query.where(GatewayAssignment.is_active == True)

        result = await self.db.execute(query)
        return result.scalar_one()

    async def count_by_farm(self, farm_id: int, active_only: bool = False) -> int:
        """
        Count assignments for a farm

        Args:
            farm_id: Farm ID
            active_only: Only count active assignments

        Returns:
            Number of assignments
        """
        from sqlalchemy import func

        query = select(func.count()).select_from(GatewayAssignment).where(
            GatewayAssignment.farm_id == farm_id
        )

        if active_only:
            query = query.where(GatewayAssignment.is_active == True)

        result = await self.db.execute(query)
        return result.scalar_one()

    async def get_with_relations(self, assignment_id: int) -> Optional[GatewayAssignment]:
        """
        Get assignment with gateway and farm eager loaded

        Args:
            assignment_id: Assignment ID

        Returns:
            GatewayAssignment instance with relations or None
        """
        result = await self.db.execute(
            select(GatewayAssignment)
            .options(
                selectinload(GatewayAssignment.gateway),
                selectinload(GatewayAssignment.farm)
            )
            .where(GatewayAssignment.id == assignment_id)
        )
        return result.scalar_one_or_none()
