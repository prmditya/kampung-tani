"""
Base Repository
Abstract base class for all repositories following DRY principle
"""

from typing import Generic, TypeVar, Type, Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.models.base import Base

logger = logging.getLogger(__name__)

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Base repository with common CRUD operations
    Follows Single Responsibility Principle (SRP)
    """

    def __init__(self, model: Type[ModelType], db: AsyncSession):
        """
        Initialize repository with model and database session

        Args:
            model: SQLAlchemy model class
            db: Async database session
        """
        self.model = model
        self.db = db

    async def get_by_id(self, id: int) -> Optional[ModelType]:
        """
        Get a single record by ID

        Args:
            id: Record ID

        Returns:
            Model instance or None if not found
        """
        try:
            result = await self.db.execute(
                select(self.model).where(self.model.id == id)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            logger.error(f"Error getting {self.model.__name__} by id {id}: {e}")
            raise

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        order_by: Any = None
    ) -> List[ModelType]:
        """
        Get all records with pagination

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            order_by: Column to order by

        Returns:
            List of model instances
        """
        try:
            query = select(self.model)

            if order_by is not None:
                query = query.order_by(order_by)

            query = query.offset(skip).limit(limit)
            result = await self.db.execute(query)
            return list(result.scalars().all())
        except SQLAlchemyError as e:
            logger.error(f"Error getting all {self.model.__name__}: {e}")
            raise

    async def count(self, **filters) -> int:
        """
        Count records with optional filters

        Args:
            **filters: Filter conditions

        Returns:
            Number of matching records
        """
        try:
            query = select(func.count()).select_from(self.model)

            for key, value in filters.items():
                if value is not None:
                    query = query.where(getattr(self.model, key) == value)

            result = await self.db.execute(query)
            return result.scalar_one()
        except SQLAlchemyError as e:
            logger.error(f"Error counting {self.model.__name__}: {e}")
            raise

    async def create(self, **data) -> ModelType:
        """
        Create a new record

        Args:
            **data: Record data

        Returns:
            Created model instance
        """
        try:
            instance = self.model(**data)
            self.db.add(instance)
            await self.db.flush()
            await self.db.refresh(instance)
            return instance
        except SQLAlchemyError as e:
            logger.error(f"Error creating {self.model.__name__}: {e}")
            raise

    async def update(self, id: int, **data) -> Optional[ModelType]:
        """
        Update a record by ID

        Args:
            id: Record ID
            **data: Updated data

        Returns:
            Updated model instance or None if not found
        """
        try:
            # Remove None values
            data = {k: v for k, v in data.items() if v is not None}

            if not data:
                return await self.get_by_id(id)

            await self.db.execute(
                update(self.model)
                .where(self.model.id == id)
                .values(**data)
            )
            await self.db.flush()

            return await self.get_by_id(id)
        except SQLAlchemyError as e:
            logger.error(f"Error updating {self.model.__name__} with id {id}: {e}")
            raise

    async def delete(self, id: int) -> bool:
        """
        Delete a record by ID

        Args:
            id: Record ID

        Returns:
            True if deleted, False if not found
        """
        try:
            result = await self.db.execute(
                delete(self.model).where(self.model.id == id)
            )
            await self.db.flush()
            return result.rowcount > 0
        except SQLAlchemyError as e:
            logger.error(f"Error deleting {self.model.__name__} with id {id}: {e}")
            raise

    async def exists(self, **filters) -> bool:
        """
        Check if a record exists with given filters

        Args:
            **filters: Filter conditions

        Returns:
            True if exists, False otherwise
        """
        try:
            query = select(func.count()).select_from(self.model)

            for key, value in filters.items():
                if value is not None:
                    query = query.where(getattr(self.model, key) == value)

            result = await self.db.execute(query)
            count = result.scalar_one()
            return count > 0
        except SQLAlchemyError as e:
            logger.error(f"Error checking existence in {self.model.__name__}: {e}")
            raise
