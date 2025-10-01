"""
Helper utilities for Kampung Tani IoT API
"""
from datetime import datetime, timezone
from app.config import Config
import logging

logger = logging.getLogger(__name__)

def convert_utc_to_wib(utc_dt_str, config=None):
    """Convert UTC datetime string to WIB timezone"""
    if not utc_dt_str:
        return None
    
    if config is None:
        config = Config()
    
    try:
        if isinstance(utc_dt_str, datetime):
            utc_dt = utc_dt_str
        else:
            utc_dt = datetime.fromisoformat(utc_dt_str.replace('Z', '+00:00'))
        
        if utc_dt.tzinfo is None:
            utc_dt = utc_dt.replace(tzinfo=timezone.utc)
        
        wib_dt = utc_dt.astimezone(config.WIB_TIMEZONE)
        return wib_dt.isoformat()
    except Exception as e:
        logger.warning(f"Error converting timezone: {e}")
        return utc_dt_str

def validate_pagination(page, limit, config=None):
    """Validate and sanitize pagination parameters"""
    if config is None:
        config = Config()
    
    page = max(1, page) if page else 1
    limit = max(1, min(limit, config.MAX_PAGE_SIZE)) if limit else config.DEFAULT_PAGE_SIZE
    offset = (page - 1) * limit
    
    return {
        'page': page,
        'limit': limit,
        'offset': offset
    }