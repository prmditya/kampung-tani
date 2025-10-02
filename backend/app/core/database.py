"""
FastAPI Database Connection Management
Clean, efficient database utilities
"""

import psycopg2
import psycopg2.extras
from typing import Generator, Optional
from contextlib import contextmanager
import logging

from .config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def get_database_connection():
    """Get a direct database connection"""
    try:
        conn = psycopg2.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            cursor_factory=psycopg2.extras.RealDictCursor
        )
        return conn
    except psycopg2.Error as e:
        logger.error(f"Database connection error: {e}")
        raise


@contextmanager
def get_db_cursor():
    """Context manager for database operations"""
    conn = None
    cursor = None
    try:
        conn = get_database_connection()
        cursor = conn.cursor()
        yield cursor
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Database operation error: {e}")
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def get_db() -> Generator:
    """FastAPI dependency for database connection"""
    with get_db_cursor() as cursor:
        yield cursor


# Database health check
def check_database_health() -> bool:
    """Check if database is accessible"""
    try:
        with get_db_cursor() as cursor:
            cursor.execute("SELECT 1")
            return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False