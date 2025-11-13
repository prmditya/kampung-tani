"""
Async SQLAlchemy Database Configuration
Clean, efficient async database management with dependency injection
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
    AsyncEngine
)
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import logging

from app.core.config import get_settings
from app.models.base import Base

logger = logging.getLogger(__name__)
settings = get_settings()


# Create async engine
def get_async_engine() -> AsyncEngine:
    """
    Create and configure async SQLAlchemy engine

    Returns:
        AsyncEngine: Configured async database engine
    """
    database_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://")

    engine = create_async_engine(
        database_url,
        echo=settings.DEBUG,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=3600,
    )

    return engine


# Create async session factory
engine = get_async_engine()
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# Create sync engine and session factory for background jobs
# (APScheduler and other sync background tasks need sync sessions)
def get_sync_engine():
    """Create synchronous database engine for background jobs"""
    database_url = settings.database_url.replace("postgresql://", "postgresql+psycopg2://")

    sync_engine = create_engine(
        database_url,
        echo=settings.DEBUG,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=3600,
    )

    return sync_engine


sync_engine = get_sync_engine()
SessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency for database session

    Yields:
        AsyncSession: Database session for request handling

    Usage:
        @app.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(Item))
            return result.scalars().all()
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database tables
    Creates all tables defined in models if they don't exist

    Note: In production, use Alembic migrations instead
    """
    async with engine.begin() as conn:
        # Drop all tables (use with caution!)
        # await conn.run_sync(Base.metadata.drop_all)

        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

    logger.info("✅ Database tables created successfully")


async def check_database_health() -> bool:
    """
    Check if database is accessible and responsive

    Returns:
        bool: True if database is healthy, False otherwise
    """
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False


async def close_db() -> None:
    """
    Close database connections
    Should be called on application shutdown
    """
    await engine.dispose()
    sync_engine.dispose()
    logger.info("✅ Database connections closed")
