"""
Swagger models untuk dokumentasi API Kampung Tani IoT
"""
from flask_restx import fields

def create_swagger_models(api):
    """Create and register all Swagger models"""
    
    # Pagination model
    pagination_model = api.model('Pagination', {
        'page': fields.Integer(required=True, description='Current page number'),
        'limit': fields.Integer(required=True, description='Items per page'),
        'total': fields.Integer(required=True, description='Total number of items'),
        'pages': fields.Integer(required=True, description='Total number of pages')
    })

    # Sensor data model
    sensor_data_model = api.model('SensorData', {
        'id': fields.Integer(required=True, description='Sensor data ID'),
        'device_id': fields.Integer(required=True, description='Device ID'),
        'device_name': fields.String(required=True, description='Device name'),
        'user_name': fields.String(required=True, description='User name'),
        'created_at': fields.String(required=True, description='Timestamp in WIB'),
        'moisture': fields.Float(description='Soil moisture percentage'),
        'temperature': fields.Float(description='Temperature in Celsius'),
        'conductivity': fields.Float(description='Electrical conductivity (μS/cm)'),
        'ph': fields.Float(description='pH level'),
        'nitrogen': fields.Float(description='Nitrogen content (mg/kg)'),
        'phosphorus': fields.Float(description='Phosphorus content (mg/kg)'),
        'potassium': fields.Float(description='Potassium content (mg/kg)'),
        'salinity': fields.Float(description='Salinity level (ppt)'),
        'tds': fields.Float(description='Total Dissolved Solids'),
    })

    # Device model
    device_model = api.model('Device', {
        'id': fields.Integer(required=True, description='Device ID'),
        'name': fields.String(required=True, description='Device name'),
        'address': fields.Integer(required=True, description='Device address'),
        'baud_rate': fields.Integer(required=True, description='Baud rate'),
        'type': fields.String(required=True, description='Device type'),
        'status': fields.String(required=True, description='Device status'),
        'last_seen': fields.String(description='Last seen timestamp in WIB'),
        'uptime_seconds': fields.Integer(description='Uptime in seconds'),
        'user_name': fields.String(required=True, description='User name'),
        'created_at': fields.String(description='Creation timestamp in WIB'),
        'updated_at': fields.String(description='Update timestamp in WIB'),
    })

    # Device stats model
    device_stats_model = api.model('DeviceStats', {
        'total_devices': fields.Integer(required=True, description='Total number of devices'),
        'status_counts': fields.Raw(required=True, description='Device status counts'),
        'recent_data_count': fields.Integer(required=True, description='Recent data entries count')
    })

    # Device status history model
    device_status_history_model = api.model('DeviceStatusHistory', {
        'status': fields.String(required=True, description='Device status'),
        'uptime_seconds': fields.Integer(description='Uptime in seconds'),
        'created_at': fields.String(description='Timestamp in WIB')
    })

    # Response models
    sensor_response_model = api.model('SensorDataResponse', {
        'data': fields.List(fields.Nested(sensor_data_model), required=True),
        'pagination': fields.Nested(pagination_model, required=True),
        'status': fields.String(required=True, description='Response status', example='success')
    })

    device_response_model = api.model('DeviceResponse', {
        'data': fields.List(fields.Nested(device_model), required=True),
        'pagination': fields.Nested(pagination_model, required=True),
        'status': fields.String(required=True, description='Response status', example='success')
    })

    device_stats_response_model = api.model('DeviceStatsResponse', {
        'data': fields.Nested(device_stats_model, required=True),
        'status': fields.String(required=True, description='Response status', example='success')
    })

    device_status_history_response_model = api.model('DeviceStatusHistoryResponse', {
        'data': fields.List(fields.Nested(device_status_history_model), required=True),
        'status': fields.String(required=True, description='Response status', example='success')
    })

    # Error model
    error_model = api.model('Error', {
        'message': fields.String(required=True, description='Error message'),
        'status': fields.String(required=True, description='Error status', example='error')
    })

    return {
        'pagination': pagination_model,
        'sensor_data': sensor_data_model,
        'device': device_model,
        'device_stats': device_stats_model,
        'device_status_history': device_status_history_model,
        'sensor_response': sensor_response_model,
        'device_response': device_response_model,
        'device_stats_response': device_stats_response_model,
        'device_status_history_response': device_status_history_response_model,
        'error': error_model
    }