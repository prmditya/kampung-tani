"""
Farmer Repository
Database operations for Farmer model
"""

from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.farmer import Farmer
from app.models.farm import Farm
from app.api.v1.repositories.base_repository import BaseRepository


class FarmerRepository(BaseRepository[Farmer]):
    """Repository for Farmer model operations"""

    def __init__(self, db: AsyncSession):
        super().__init__(Farmer, db)

    async def get_with_farms(self, farmer_id: int) -> Optional[Farmer]:
        """
        Get farmer with farms eager loaded

        Args:
            farmer_id: Farmer ID

        Returns:
            Farmer instance with farms or None
        """
        result = await self.db.execute(
            select(Farmer)
            .options(selectinload(Farmer.farms))
            .where(Farmer.id == farmer_id)
        )
        return result.scalar_one_or_none()

    async def search_by_name(
        self,
        search: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Farmer]:
        """
        Search farmers by name

        Args:
            search: Search string
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            List of Farmer instances
        """
        search_filter = f"%{search}%"
        result = await self.db.execute(
            select(Farmer)
            .where(Farmer.name.ilike(search_filter))
            .order_by(Farmer.name)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def count_with_search(self, search: Optional[str] = None) -> int:
        """
        Count farmers with optional search filter

        Args:
            search: Search string

        Returns:
            Number of matching farmers
        """
        from sqlalchemy import func

        query = select(func.count()).select_from(Farmer)

        if search:
            search_filter = f"%{search}%"
            query = query.where(Farmer.name.ilike(search_filter))

        result = await self.db.execute(query)
        return result.scalar_one()
