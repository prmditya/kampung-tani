"""
Farm Repository
Database operations for Farm model
"""

from typing import Optional, List
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.farm import Farm
from app.models.farmer import Farmer
from app.models.gateway_assignment import GatewayAssignment
from app.api.v1.repositories.base_repository import BaseRepository


class FarmRepository(BaseRepository[Farm]):
    """Repository for Farm model operations"""

    def __init__(self, db: AsyncSession):
        super().__init__(Farm, db)

    async def get_by_farmer(
        self,
        farmer_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Farm]:
        """
        Get farms belonging to a farmer

        Args:
            farmer_id: Farmer ID
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            List of Farm instances
        """
        result = await self.db.execute(
            select(Farm)
            .where(Farm.farmer_id == farmer_id)
            .order_by(Farm.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def count_by_farmer(self, farmer_id: int) -> int:
        """
        Count farms for a farmer

        Args:
            farmer_id: Farmer ID

        Returns:
            Number of farms
        """
        from sqlalchemy import func

        result = await self.db.execute(
            select(func.count())
            .select_from(Farm)
            .where(Farm.farmer_id == farmer_id)
        )
        return result.scalar_one()

    async def search_by_name(
        self,
        search: str,
        farmer_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Farm]:
        """
        Search farms by name

        Args:
            search: Search string
            farmer_id: Optional farmer ID filter
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            List of Farm instances
        """
        search_filter = f"%{search}%"
        query = select(Farm).where(Farm.name.ilike(search_filter))

        if farmer_id:
            query = query.where(Farm.farmer_id == farmer_id)

        query = query.order_by(Farm.name).offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_with_search(
        self,
        search: Optional[str] = None,
        farmer_id: Optional[int] = None
    ) -> int:
        """
        Count farms with optional search and farmer filter

        Args:
            search: Search string
            farmer_id: Optional farmer ID filter

        Returns:
            Number of matching farms
        """
        from sqlalchemy import func

        query = select(func.count()).select_from(Farm)

        conditions = []
        if search:
            search_filter = f"%{search}%"
            conditions.append(Farm.name.ilike(search_filter))

        if farmer_id:
            conditions.append(Farm.farmer_id == farmer_id)

        if conditions:
            query = query.where(and_(*conditions))

        result = await self.db.execute(query)
        return result.scalar_one()

    async def get_with_assignments(self, farm_id: int) -> Optional[Farm]:
        """
        Get farm with gateway assignments eager loaded

        Args:
            farm_id: Farm ID

        Returns:
            Farm instance with assignments or None
        """
        result = await self.db.execute(
            select(Farm)
            .options(selectinload(Farm.gateway_assignments))
            .where(Farm.id == farm_id)
        )
        return result.scalar_one_or_none()

    async def get_with_farmer(self, farm_id: int) -> Optional[Farm]:
        """
        Get farm with farmer information eager loaded

        Args:
            farm_id: Farm ID

        Returns:
            Farm instance with farmer or None
        """
        result = await self.db.execute(
            select(Farm)
            .options(selectinload(Farm.farmer))
            .where(Farm.id == farm_id)
        )
        return result.scalar_one_or_none()
