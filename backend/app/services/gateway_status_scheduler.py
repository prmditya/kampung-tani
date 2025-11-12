"""
Gateway Status Scheduler
Background job to automatically detect offline gateways based on last_seen timestamp
"""

import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from sqlalchemy import select, and_

from app.core.database import SessionLocal
from app.models.gateway import Gateway
from app.models.gateway_status_history import GatewayStatusHistory

logger = logging.getLogger(__name__)

# Scheduler instance
scheduler = None


def check_offline_gateways():
    """
    Check for gateways that should be marked as offline
    This runs every 30 seconds and marks gateways as offline if they haven't sent data in 2 minutes
    """
    db: Session = SessionLocal()
    try:
        # Get gateways that should be offline (no activity in 2 minutes, not in maintenance)
        offline_threshold_minutes = 2
        threshold_time = datetime.now() - timedelta(
            minutes=offline_threshold_minutes
        )

        logger.debug(f"🔍 Checking for offline gateways (threshold: {threshold_time.isoformat()})")

        # Query gateways that:
        # 1. Have last_seen older than threshold OR last_seen is NULL
        # 2. Are not already offline
        # 3. Are not in maintenance mode
        stmt = select(Gateway).where(
            and_(
                Gateway.status != "offline",
                Gateway.status != "maintenance",
                (Gateway.last_seen < threshold_time) | (Gateway.last_seen.is_(None)),
            )
        )

        result = db.execute(stmt)
        offline_gateways = result.scalars().all()

        if not offline_gateways:
            logger.debug("✅ No gateways to mark as offline")
            return

        logger.info(f"⚠️  Found {len(offline_gateways)} gateways to mark as offline")

        # Update each gateway to offline status
        updated_count = 0
        for gateway in offline_gateways:
            try:
                old_status = gateway.status
                gateway.status = "offline"

                # Create status history entry
                history_entry = GatewayStatusHistory(
                    gateway_id=gateway.id,
                    status="offline",
                    uptime_seconds=None,  # No uptime data when going offline
                )
                db.add(history_entry)

                logger.info(
                    f"Gateway {gateway.gateway_uid} marked as offline (was {old_status}, "
                    f"last seen: {gateway.last_seen})"
                )
                updated_count += 1

            except Exception as e:
                logger.error(
                    f"Error marking gateway {gateway.gateway_uid} as offline: {e}"
                )
                continue

        # Commit all changes
        if updated_count > 0:
            db.commit()
            logger.info(
                f"✅ Successfully updated {updated_count} gateway(s) to offline status"
            )
        else:
            logger.warning("⚠️  No gateways were updated (possible errors)")

    except Exception as e:
        logger.error(f"❌ Error in check_offline_gateways job: {e}")
        import traceback
        logger.error(traceback.format_exc())
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    """Start the background scheduler"""
    global scheduler

    if scheduler is not None:
        logger.warning("Scheduler already running")
        return

    scheduler = AsyncIOScheduler()

    # Add job to check offline gateways every 30 seconds
    scheduler.add_job(
        check_offline_gateways,
        trigger=IntervalTrigger(seconds=30),
        id="check_offline_gateways",
        name="Check and mark offline gateways",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("✅ Gateway status scheduler started (checking every 30 seconds)")


def stop_scheduler():
    """Stop the background scheduler"""
    global scheduler

    if scheduler is not None:
        scheduler.shutdown()
        scheduler = None
        logger.info("🛑 Gateway status scheduler stopped")
