"""
Legacy Database utilities - DEPRECATED
Use app.core.database instead for new code
"""

import psycopg2
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)


def get_db_connection():
    """Get database connection - DEPRECATED: Use app.core.database.get_database_connection()"""
    settings = get_settings()

    return psycopg2.connect(
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        dbname=settings.DB_NAME,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
    )
