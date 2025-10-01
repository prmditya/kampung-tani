"""
Device resources untuk Kampung Tani IoT API
"""
from flask import request
from flask_restx import Resource, Namespace
from app.utils.database import get_db_connection
from app.utils.helpers import convert_utc_to_wib, validate_pagination
from app.config import Config
from datetime import datetime, timezone, timedelta
import logging

logger = logging.getLogger(__name__)

def create_device_namespace(api, models):
    """Create device namespace with all endpoints"""
    
    device_ns = Namespace('devices', description='Device management operations')
    
    @device_ns.route('/')
    class DeviceListResource(Resource):
        @device_ns.doc('list_devices')
        @device_ns.param('page', 'Page number', type='integer', default=1)
        @device_ns.param('limit', 'Items per page', type='integer', default=50)
        @device_ns.marshal_with(models['device_response'])
        @device_ns.response(200, 'Success', models['device_response'])
        @device_ns.response(500, 'Internal Server Error', models['error'])
        def get(self):
            """Get all devices with pagination (RESTful)"""
            try:
                config = Config()
                page = request.args.get('page', 1, type=int)
                limit = request.args.get('limit', 50, type=int)
                
                # Validate pagination parameters
                pagination = validate_pagination(page, limit, config)
                
                conn = get_db_connection(config)
                cur = conn.cursor()
                
                query = """
                SELECT 
                    d.id, d.name, d.address, d.baud_rate, d.type,
                    d.created_at, d.updated_at, u.name as user_name,
                    MAX(sd.created_at) as last_data_time,
                    CASE 
                        WHEN MAX(sd.created_at) IS NULL OR MAX(sd.created_at) < NOW() - INTERVAL '%s minutes' THEN 'offline'
                        ELSE 'online'
                    END as status,
                    d.uptime_seconds
                FROM devices d
                JOIN users u ON d.user_id = u.id
                LEFT JOIN sensor_data sd ON d.id = sd.device_id
                GROUP BY d.id, d.name, d.address, d.baud_rate, d.type, d.created_at, d.updated_at, u.name, d.uptime_seconds
                ORDER BY last_data_time DESC NULLS LAST, d.name
                LIMIT %s OFFSET %s
                """
                
                cur.execute(query, (config.OFFLINE_THRESHOLD_MINUTES, pagination['limit'], pagination['offset']))
                rows = cur.fetchall()
                
                # Get total count
                cur.execute("SELECT COUNT(*) FROM devices")
                total = cur.fetchone()[0]
                
                cur.close()
                conn.close()
                
                devices = []
                for row in rows:
                    devices.append({
                        'id': row[0],
                        'name': row[1],
                        'address': row[2],
                        'baud_rate': row[3],
                        'type': row[4],
                        'status': row[9],
                        'last_seen': convert_utc_to_wib(row[8], config) if row[8] else None,
                        'uptime_seconds': row[10] if row[10] is not None else 0,
                        'created_at': convert_utc_to_wib(row[5], config) if row[5] else None,
                        'updated_at': convert_utc_to_wib(row[6], config) if row[6] else None,
                        'user_name': row[7]
                    })
                
                return {
                    'data': devices,
                    'pagination': {
                        'page': pagination['page'],
                        'limit': pagination['limit'],
                        'total': total,
                        'pages': (total + pagination['limit'] - 1) // pagination['limit']
                    },
                    'status': 'success'
                }
                
            except Exception as e:
                logger.error(f"Error getting devices: {e}")
                device_ns.abort(500, f"Database error: {str(e)}")

    @device_ns.route('/stats')
    class DeviceStatsResource(Resource):
        @device_ns.doc('get_device_stats')
        @device_ns.marshal_with(models['device_stats_response'])
        @device_ns.response(200, 'Success', models['device_stats_response'])
        @device_ns.response(500, 'Internal Server Error', models['error'])
        def get(self):
            """Get device statistics (RESTful)"""
            try:
                config = Config()
                conn = get_db_connection(config)
                cur = conn.cursor()
                
                # Count devices by status
                cur.execute("""
                    SELECT 
                        d.id,
                        CASE 
                            WHEN MAX(sd.created_at) IS NULL OR MAX(sd.created_at) < NOW() - INTERVAL '%s minutes' THEN 'offline'
                            ELSE 'online'
                        END as calculated_status
                    FROM devices d
                    LEFT JOIN sensor_data sd ON d.id = sd.device_id
                    GROUP BY d.id
                """, (config.OFFLINE_THRESHOLD_MINUTES,))
                device_statuses = cur.fetchall()
                
                online_count = sum(1 for _, status in device_statuses if status == 'online')
                offline_count = sum(1 for _, status in device_statuses if status == 'offline')
                
                # Recent sensor data count
                cur.execute("""
                    SELECT COUNT(*) FROM sensor_data 
                    WHERE created_at >= NOW() - INTERVAL '1 hour'
                """)
                recent_data_count = cur.fetchone()[0]
                
                cur.close()
                conn.close()
                
                return {
                    'data': {
                        'total_devices': len(device_statuses),
                        'status_counts': {
                            'online': online_count,
                            'offline': offline_count,
                            'restarted': 0  # Placeholder for future implementation
                        },
                        'recent_data_count': recent_data_count
                    },
                    'status': 'success'
                }
                
            except Exception as e:
                logger.error(f"Error getting device stats: {e}")
                device_ns.abort(500, f"Database error: {str(e)}")

    @device_ns.route('/<int:device_id>/status-history')
    @device_ns.param('device_id', 'Device ID', type='integer')
    class DeviceStatusHistoryResource(Resource):
        @device_ns.doc('get_device_status_history')
        @device_ns.param('limit', 'Maximum number of history entries', type='integer', default=50)
        @device_ns.marshal_with(models['device_status_history_response'])
        @device_ns.response(200, 'Success', models['device_status_history_response'])
        @device_ns.response(404, 'Device not found', models['error'])
        @device_ns.response(500, 'Internal Server Error', models['error'])
        def get(self, device_id):
            """Get device status history based on sensor data activity"""
            try:
                config = Config()
                limit = request.args.get('limit', 50, type=int)
                limit = max(1, min(limit, config.MAX_PAGE_SIZE))  # Cap at max page size
                
                conn = get_db_connection(config)
                cur = conn.cursor()
                
                # Check if device exists
                cur.execute("SELECT id, name FROM devices WHERE id = %s", (device_id,))
                device = cur.fetchone()
                if not device:
                    device_ns.abort(404, f"Device {device_id} not found")
                
                # Get recent sensor data timestamps for this device
                cur.execute("""
                    SELECT created_at
                    FROM sensor_data
                    WHERE device_id = %s AND created_at IS NOT NULL
                    ORDER BY created_at DESC
                    LIMIT %s
                """, (device_id, limit))
                
                timestamps = [row[0] for row in cur.fetchall()]
                
                cur.close()
                conn.close()
                
                # Generate consolidated status history based on data activity patterns
                history = []
                now = datetime.now(timezone.utc)
                
                if not timestamps:
                    # No data found - device is offline
                    history.append({
                        'status': 'offline',
                        'uptime_seconds': 0,
                        'created_at': convert_utc_to_wib(now, config)
                    })
                else:
                    # Normalize all timestamps to UTC with timezone info
                    normalized_timestamps = []
                    for ts in timestamps:
                        if ts.tzinfo is None:
                            ts = ts.replace(tzinfo=timezone.utc)
                        normalized_timestamps.append(ts)
                    
                    # Group consecutive periods by status
                    current_status = None
                    current_start_time = None
                    total_uptime = 0
                    
                    # Process timestamps in chronological order (reverse)
                    normalized_timestamps.reverse()
                    
                    # First, determine the current actual status
                    most_recent_time = normalized_timestamps[-1] if normalized_timestamps else now
                    current_actual_status = 'online' if (now - most_recent_time).total_seconds() <= config.OFFLINE_THRESHOLD_MINUTES * 60 else 'offline'
                    
                    for i, timestamp in enumerate(normalized_timestamps):
                        # Determine status based on gap from previous timestamp
                        if i == 0:
                            # First entry (oldest) - start tracking from here
                            status = 'online'  # Assume online when first data came in
                            current_start_time = timestamp
                            current_status = status
                        else:
                            previous_timestamp = normalized_timestamps[i-1]
                            time_gap = (timestamp - previous_timestamp).total_seconds()
                            
                            if time_gap > config.OFFLINE_THRESHOLD_MINUTES * 60:
                                new_status = 'offline'
                            elif time_gap > config.RESTART_THRESHOLD_MINUTES * 60:
                                new_status = 'restarted'
                            else:
                                new_status = 'online'
                            
                            # If status changed, add the previous period to history
                            if new_status != current_status and current_start_time:
                                period_duration = (timestamp - current_start_time).total_seconds()
                                if current_status == 'online':
                                    total_uptime += period_duration
                                    
                                history.append({
                                    'status': current_status,
                                    'uptime_seconds': int(total_uptime) if current_status == 'online' else int(period_duration),
                                    'created_at': convert_utc_to_wib(current_start_time, config)
                                })
                            
                            current_status = new_status
                            current_start_time = timestamp
                    
                    # Add the final period from last data to now
                    if current_start_time:
                        final_duration = (now - current_start_time).total_seconds()
                        
                        # If the gap from last data to now is too long, split into online + offline periods
                        if final_duration > config.OFFLINE_THRESHOLD_MINUTES * 60 and current_status == 'online':
                            # Add the final online period (until threshold)
                            online_duration = config.OFFLINE_THRESHOLD_MINUTES * 60
                            total_uptime += online_duration
                            history.append({
                                'status': 'online',
                                'uptime_seconds': int(total_uptime),
                                'created_at': convert_utc_to_wib(current_start_time, config)
                            })
                            
                            # Add the offline period from threshold to now
                            offline_start = current_start_time + timedelta(seconds=online_duration)
                            offline_duration = (now - offline_start).total_seconds()
                            history.append({
                                'status': 'offline',
                                'uptime_seconds': int(offline_duration),
                                'created_at': convert_utc_to_wib(offline_start, config)
                            })
                        else:
                            # Normal case - add the current period
                            if current_status == 'online':
                                total_uptime += final_duration
                                
                            history.append({
                                'status': current_actual_status,  # Use actual current status
                                'uptime_seconds': int(total_uptime) if current_actual_status == 'online' else int(final_duration),
                                'created_at': convert_utc_to_wib(current_start_time, config)
                            })
                    
                    # Reverse back to show most recent first
                    history.reverse()
                    
                    # Limit to avoid too many entries
                    history = history[:limit]
                
                return {
                    'data': history,
                    'status': 'success'
                }
                
            except Exception as e:
                logger.error(f"Error getting device status history for {device_id}: {e}")
                device_ns.abort(500, f"Database error: {str(e)}")
    
    return device_ns