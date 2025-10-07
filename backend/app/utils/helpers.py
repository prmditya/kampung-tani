"""
Helper utilities for Kampung Tani IoT API
"""

from datetime import datetime, timezone
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)


def convert_utc_to_wib(utc_dt_str, config=None):
    """Convert UTC datetime string to WIB timezone"""
    if not utc_dt_str:
        return None

    if config is None:
        settings = get_settings()

    try:
        if isinstance(utc_dt_str, datetime):
            utc_dt = utc_dt_str
        else:
            utc_dt = datetime.fromisoformat(utc_dt_str.replace("Z", "+00:00"))

        if utc_dt.tzinfo is None:
            utc_dt = utc_dt.replace(tzinfo=timezone.utc)

        # Use fixed WIB timezone (+7)
        from datetime import timedelta

        wib_tz = timezone(timedelta(hours=7))
        wib_dt = utc_dt.astimezone(wib_tz)
        return wib_dt.isoformat()
    except Exception as e:
        logger.warning(f"Error converting timezone: {e}")
        return utc_dt_str


def validate_pagination(page, limit, config=None):
    """Validate and sanitize pagination parameters"""
    if config is None:
        settings = get_settings()

    page = max(1, page) if page else 1
    # Use reasonable defaults
    limit = max(1, min(limit, 200)) if limit else 50
    offset = (page - 1) * limit

    return {"page": page, "limit": limit, "offset": offset}
