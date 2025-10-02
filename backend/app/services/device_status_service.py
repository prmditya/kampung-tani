"""
Device Status Management Service
Handles device online/offline status and status history tracking
"""

import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.core.database import get_db_cursor

logger = logging.getLogger(__name__)

class DeviceStatusService:
    """Service for managing device status and history"""
    
    OFFLINE_THRESHOLD_MINUTES = 5
    
    @classmethod
    def update_device_last_seen(cls, device_id: int) -> bool:
        """Update device last_seen timestamp and mark as online"""
        try:
            with get_db_cursor() as cursor:
                # Get current device status
                cursor.execute(
                    "SELECT status, last_seen FROM devices WHERE id = %s",
                    (device_id,)
                )
                device = cursor.fetchone()
                
                if not device:
                    logger.warning(f"Device {device_id} not found")
                    return False
                
                current_status = device['status']
                last_seen = device['last_seen']
                
                # Update last_seen and status to online
                cursor.execute(
                    """
                    UPDATE devices 
                    SET last_seen = NOW(), status = 'online', updated_at = NOW() 
                    WHERE id = %s
                    """,
                    (device_id,)
                )
                
                # If device was offline, record the status change in history
                if current_status == 'offline':
                    cls._record_status_change(device_id, 'online', last_seen)
                    logger.info(f"Device {device_id} came back online")
                
                return True
                
        except Exception as e:
            logger.error(f"Error updating device last_seen for device {device_id}: {e}")
            return False
    
    @classmethod
    def check_offline_devices(cls) -> List[int]:
        """Check for devices that should be marked as offline and update their status"""
        offline_device_ids = []
        
        try:
            with get_db_cursor() as cursor:
                # Find devices that are online but haven't been seen for > 5 minutes
                threshold_time = datetime.now() - timedelta(minutes=cls.OFFLINE_THRESHOLD_MINUTES)
                
                cursor.execute(
                    """
                    SELECT id, name, last_seen, status 
                    FROM devices 
                    WHERE status = 'online' 
                    AND last_seen < %s
                    """,
                    (threshold_time,)
                )
                
                stale_devices = cursor.fetchall()
                
                for device in stale_devices:
                    device_id = device['id']
                    device_name = device['name']
                    last_seen = device['last_seen']
                    
                    # Mark device as offline
                    cursor.execute(
                        """
                        UPDATE devices 
                        SET status = 'offline', updated_at = NOW() 
                        WHERE id = %s
                        """,
                        (device_id,)
                    )
                    
                    # Record status change in history
                    cls._record_status_change(device_id, 'offline', last_seen)
                    
                    offline_device_ids.append(device_id)
                    logger.info(f"Device {device_name} (ID: {device_id}) marked as offline - last seen: {last_seen}")
                
        except Exception as e:
            logger.error(f"Error checking offline devices: {e}")
        
        return offline_device_ids
    
    @classmethod
    def _record_status_change(cls, device_id: int, new_status: str, last_status_time: Optional[datetime] = None):
        """Record device status change in history with uptime calculation"""
        try:
            with get_db_cursor() as cursor:
                # Calculate uptime if transitioning from online to offline
                uptime_seconds = None
                
                if new_status == 'offline' and last_status_time:
                    # Get the last time this device came online
                    cursor.execute(
                        """
                        SELECT created_at 
                        FROM device_status_history 
                        WHERE device_id = %s AND status = 'online' 
                        ORDER BY created_at DESC 
                        LIMIT 1
                        """,
                        (device_id,)
                    )
                    
                    last_online = cursor.fetchone()
                    if last_online and last_online['created_at']:
                        online_time = last_online['created_at']
                        uptime_delta = last_status_time - online_time
                        uptime_seconds = int(uptime_delta.total_seconds())
                    else:
                        # If no previous online record, calculate from device creation
                        cursor.execute(
                            "SELECT created_at FROM devices WHERE id = %s",
                            (device_id,)
                        )
                        device_created = cursor.fetchone()
                        if device_created and device_created['created_at']:
                            uptime_delta = last_status_time - device_created['created_at']
                            uptime_seconds = int(uptime_delta.total_seconds())
                
                # Insert status history record
                cursor.execute(
                    """
                    INSERT INTO device_status_history (device_id, status, uptime_seconds)
                    VALUES (%s, %s, %s)
                    """,
                    (device_id, new_status, uptime_seconds)
                )
                
                logger.info(f"Recorded status change for device {device_id}: {new_status} (uptime: {uptime_seconds}s)")
                
        except Exception as e:
            logger.error(f"Error recording status change for device {device_id}: {e}")
    
    @classmethod
    def get_device_status_history(cls, device_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        """Get status history for a specific device"""
        try:
            with get_db_cursor() as cursor:
                cursor.execute(
                    """
                    SELECT status, uptime_seconds, created_at
                    FROM device_status_history 
                    WHERE device_id = %s 
                    ORDER BY created_at DESC 
                    LIMIT %s
                    """,
                    (device_id, limit)
                )
                
                history = cursor.fetchall()
                return [dict(record) for record in history]
                
        except Exception as e:
            logger.error(f"Error getting status history for device {device_id}: {e}")
            return []
    
    @classmethod
    def get_device_current_uptime(cls, device_id: int) -> Optional[int]:
        """Get current uptime in seconds for an online device"""
        try:
            with get_db_cursor() as cursor:
                cursor.execute(
                    """
                    SELECT status, last_seen, 
                           CASE 
                               WHEN status = 'online' THEN 
                                   EXTRACT(EPOCH FROM (NOW() - (
                                       SELECT COALESCE(
                                           (SELECT created_at 
                                            FROM device_status_history 
                                            WHERE device_id = %s AND status = 'online' 
                                            ORDER BY created_at DESC 
                                            LIMIT 1),
                                           (SELECT created_at FROM devices WHERE id = %s)
                                       )
                                   )))::INTEGER
                               ELSE NULL
                           END as current_uptime_seconds
                    FROM devices 
                    WHERE id = %s
                    """,
                    (device_id, device_id, device_id)
                )
                
                result = cursor.fetchone()
                if result and result['status'] == 'online':
                    return result['current_uptime_seconds']
                
                return None
                
        except Exception as e:
            logger.error(f"Error getting current uptime for device {device_id}: {e}")
            return None
    
    @classmethod
    def format_uptime(cls, seconds: Optional[int]) -> str:
        """Format uptime seconds into human readable string"""
        if seconds is None:
            return "Unknown"
        
        if seconds < 60:
            return f"{seconds}s"
        elif seconds < 3600:
            minutes = seconds // 60
            remaining_seconds = seconds % 60
            return f"{minutes}m {remaining_seconds}s"
        elif seconds < 86400:
            hours = seconds // 3600
            remaining_minutes = (seconds % 3600) // 60
            return f"{hours}h {remaining_minutes}m"
        else:
            days = seconds // 86400
            remaining_hours = (seconds % 86400) // 3600
            return f"{days}d {remaining_hours}h"