"""
Legacy compatibility routes untuk backward compatibility
"""
from flask import jsonify
from app.utils.database import get_db_connection
from app.utils.helpers import convert_utc_to_wib
from app.config import Config
import logging

logger = logging.getLogger(__name__)

def register_legacy_routes(app):
    """Register legacy compatibility routes"""
    
    @app.route('/sensor-data')
    def sensor_data_compat():
        """Legacy endpoint - redirects to RESTful version"""
        try:
            config = Config()
            conn = get_db_connection(config)
            cur = conn.cursor()
            
            query = """
            SELECT 
                sd.id, sd.device_id, d.name as device_name, u.name as user_name,
                sd.created_at, STRING_AGG(sm.type || ':' || sm.value, '|') as measurements
            FROM sensor_data sd
            JOIN devices d ON sd.device_id = d.id
            JOIN users u ON d.user_id = u.id
            LEFT JOIN sensor_measurements sm ON sd.id = sm.sensor_data_id
            GROUP BY sd.id, sd.device_id, d.name, u.name, sd.created_at
            ORDER BY sd.created_at DESC
            LIMIT 100
            """
            
            cur.execute(query)
            rows = cur.fetchall()
            cur.close()
            conn.close()
            
            data = []
            for row in rows:
                measurements_dict = {}
                if row[5]:
                    for measurement in row[5].split('|'):
                        if ':' in measurement:
                            sensor_type, value = measurement.split(':', 1)
                            try:
                                measurements_dict[sensor_type] = float(value)
                            except ValueError:
                                measurements_dict[sensor_type] = None
                
                data.append({
                    'id': row[0],
                    'device_id': row[1],
                    'device_name': row[2],
                    'user_name': row[3],
                    'created_at': convert_utc_to_wib(row[4], config) if row[4] else None,
                    'moisture': measurements_dict.get('moisture'),
                    'temperature': measurements_dict.get('temperature'),
                    'conductivity': measurements_dict.get('conductivity'),
                    'ph': measurements_dict.get('ph'),
                    'nitrogen': measurements_dict.get('nitrogen'),
                    'phosphorus': measurements_dict.get('phosphorus'),
                    'potassium': measurements_dict.get('potassium'),
                    'salinity': measurements_dict.get('salinity'),
                    'tds': measurements_dict.get('tds'),
                    'user_id': row[1]  # backward compatibility
                })
            
            return jsonify(data)
            
        except Exception as e:
            logger.error(f"Error in legacy sensor data: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/devices')
    def devices_compat():
        """Legacy endpoint - redirects to RESTful version"""
        try:
            config = Config()
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
            """
            
            cur.execute(query, (config.OFFLINE_THRESHOLD_MINUTES,))
            rows = cur.fetchall()
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
            
            return jsonify(devices)
            
        except Exception as e:
            logger.error(f"Error in legacy devices: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/device-stats')
    def device_stats_compat():
        """Legacy endpoint - redirects to RESTful version"""
        try:
            config = Config()
            conn = get_db_connection(config)
            cur = conn.cursor()
            
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
            
            cur.execute("""
                SELECT COUNT(*) FROM sensor_data 
                WHERE created_at >= NOW() - INTERVAL '1 hour'
            """)
            recent_data_count = cur.fetchone()[0]
            
            cur.close()
            conn.close()
            
            stats = {
                'total_devices': len(device_statuses),
                'status_counts': {
                    'online': online_count,
                    'offline': offline_count,
                    'restarted': 0
                },
                'recent_data_count': recent_data_count
            }
            
            return jsonify(stats)
            
        except Exception as e:
            logger.error(f"Error in legacy device stats: {e}")
            return jsonify({'error': str(e)}), 500