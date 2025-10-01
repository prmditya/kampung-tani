"""
Database utilities for Kampung Tani IoT API
"""
import psycopg2
from app.config import Config
import logging

logger = logging.getLogger(__name__)

def get_db_connection(config=None):
    """Get database connection"""
    if config is None:
        config = Config()
    
    return psycopg2.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        dbname=config.DB_NAME,
        user=config.DB_USER,
        password=config.DB_PASS
    )