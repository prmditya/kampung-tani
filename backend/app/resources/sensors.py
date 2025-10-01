"""
Sensor data resources untuk Kampung Tani IoT API
"""
from flask import request
from flask_restx import Resource, Namespace
from app.utils.database import get_db_connection
from app.utils.helpers import convert_utc_to_wib, validate_pagination
from app.config import Config
import logging

logger = logging.getLogger(__name__)

def create_sensor_namespace(api, models):
    """Create sensor namespace with all endpoints"""
    
    sensor_ns = Namespace('sensors', description='Sensor data operations')
    
    @sensor_ns.route('/')
    class SensorDataListResource(Resource):
        @sensor_ns.doc('list_sensor_data')
        @sensor_ns.param('page', 'Page number', type='integer', default=1)
        @sensor_ns.param('limit', 'Items per page', type='integer', default=50)
        @sensor_ns.marshal_with(models['sensor_response'])
        @sensor_ns.response(200, 'Success', models['sensor_response'])
        @sensor_ns.response(500, 'Internal Server Error', models['error'])
        def get(self):
            """Get all sensor data with pagination (RESTful)"""
            try:
                config = Config()
                page = request.args.get('page', 1, type=int)
                limit = request.args.get('limit', 50, type=int)
                
                # Validate pagination parameters
                pagination = validate_pagination(page, limit, config)
                
                conn = get_db_connection(config)
                cur = conn.cursor()
                
                # Query with pagination
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
                LIMIT %s OFFSET %s
                """
                
                cur.execute(query, (pagination['limit'], pagination['offset']))
                rows = cur.fetchall()
                
                # Get total count
                cur.execute("SELECT COUNT(*) FROM sensor_data")
                total = cur.fetchone()[0]
                
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
                    })
                
                return {
                    'data': data,
                    'pagination': {
                        'page': pagination['page'],
                        'limit': pagination['limit'],
                        'total': total,
                        'pages': (total + pagination['limit'] - 1) // pagination['limit']
                    },
                    'status': 'success'
                }
                
            except Exception as e:
                logger.error(f"Error getting sensor data: {e}")
                sensor_ns.abort(500, f"Database error: {str(e)}")
    
    return sensor_ns