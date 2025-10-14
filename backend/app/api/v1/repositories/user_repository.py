"""
User Repository
Database operations for User model
"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.api.v1.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for User model operations"""

    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_username(self, username: str) -> Optional[User]:
        """
        Get user by username

        Args:
            username: Username to search for

        Returns:
            User instance or None
        """
        result = await self.db.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email

        Args:
            email: Email to search for

        Returns:
            User instance or None
        """
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def username_exists(self, username: str) -> bool:
        """
        Check if username already exists

        Args:
            username: Username to check

        Returns:
            True if exists, False otherwise
        """
        return await self.exists(username=username)

    async def email_exists(self, email: str) -> bool:
        """
        Check if email already exists

        Args:
            email: Email to check

        Returns:
            True if exists, False otherwise
        """
        return await self.exists(email=email)
