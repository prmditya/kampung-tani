#!/usr/bin/env python3
"""
Kampung Tani IoT API - Modular RESTful Edition
Modern, well-organized RESTful API with comprehensive Swagger documentation
"""

from flask import Flask, jsonify
from flask_cors import CORS
from flask_restx import Api, Resource
from datetime import datetime
import logging
import os

# Import modular components
from app.config import config, Config
from app.models.swagger_models import create_swagger_models
from app.resources.sensors import create_sensor_namespace
from app.resources.devices import create_device_namespace
from app.resources.legacy import register_legacy_routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app(config_name=None):
    """Application factory pattern"""
    
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Enable CORS
    CORS(app)
    
    # Initialize Flask-RESTX
    api = Api(
        app,
        version='2.0',
        title='Kampung Tani IoT API - Modular Edition',
        description='''
        Modern RESTful API untuk Kampung Tani IoT monitoring system
        
        Features:
        - RESTful endpoints dengan HTTP methods yang tepat
        - Dokumentasi Swagger interaktif yang lengkap
        - Dukungan pagination untuk semua list endpoints
        - Legacy endpoint compatibility
        - Error handling yang komprehensif
        - Struktur kode yang modular dan terorganisir
        
        Endpoint Structure:
        - /api/sensors/ - Data sensor dengan pagination
        - /api/devices/ - Manajemen device dengan pagination
        - /api/devices/stats - Statistik device
        - /api/devices/{id}/status-history - Riwayat status device
        ''',
        doc='/api/docs/',
        prefix='/api',
        contact='Kampung Tani Development Team',
        contact_email='dev@kampungtani.com'
    )
    
    # Create Swagger models
    models = create_swagger_models(api)
    
    # Create and register namespaces
    sensor_ns = create_sensor_namespace(api, models)
    device_ns = create_device_namespace(api, models)
    
    api.add_namespace(sensor_ns)
    api.add_namespace(device_ns)
    
    # Health check endpoint
    @api.route('/health')
    class HealthCheckResource(Resource):
        @api.doc('health_check')
        @api.response(200, 'API is healthy')
        def get(self):
            """Comprehensive API health check dengan informasi sistem"""
            try:
                from app.utils.database import get_db_connection
                config_obj = Config()
                
                conn = get_db_connection(config_obj)
                cur = conn.cursor()
                cur.execute("SELECT 1")
                db_status = "healthy"
                cur.close()
                conn.close()
            except Exception as e:
                db_status = f"unhealthy: {str(e)}"
            
            return {
                'status': 'healthy',
                'message': 'Kampung Tani IoT API v2.0 - Modular Edition',
                'version': '2.0',
                'architecture': 'modular',
                'features': [
                    'RESTful endpoints',
                    'Comprehensive Swagger documentation', 
                    'Modular code structure',
                    'Legacy compatibility',
                    'Enhanced error handling',
                    'Pagination support',
                    'Health monitoring'
                ],
                'endpoints': {
                    'documentation': '/api/docs/',
                    'health': '/api/health',
                    'sensors': '/api/sensors/',
                    'devices': '/api/devices/',
                    'device_stats': '/api/devices/stats',
                    'device_history': '/api/devices/{id}/status-history'
                },
                'database_status': db_status,
                'timestamp': datetime.now(config_obj.WIB_TIMEZONE).isoformat(),
                'timezone': 'WIB (UTC+7)'
            }
    
    # Register legacy routes for backward compatibility
    register_legacy_routes(app)
    
    # Root endpoint
    @app.route('/')
    def index():
        """API root endpoint dengan informasi lengkap"""
        return jsonify({
            "message": "🌱 Kampung Tani IoT API v2.0 - Modular Edition", 
            "documentation": "/api/docs/",
            "health": "/api/health",
            "description": "Modern, modular RESTful API with comprehensive Swagger documentation",
            "architecture": {
                "pattern": "Modular Flask-RESTX",
                "structure": "MVC with separation of concerns",
                "components": [
                    "Config management",
                    "Swagger models",
                    "Resource namespaces",
                    "Utility functions",
                    "Legacy compatibility"
                ]
            },
            "features": [
                "RESTful endpoints dengan HTTP methods yang tepat",
                "Dokumentasi Swagger interaktif yang lengkap",
                "Struktur kode modular dan maintainable",
                "Pagination support untuk semua list endpoints",
                "Legacy endpoint compatibility",
                "Enhanced error handling dan logging",
                "Database connection management",
                "Timezone handling (WIB)",
                "Health monitoring"
            ],
            "quick_start": {
                "docs": "Visit /api/docs/ for interactive documentation",
                "health": "Check /api/health for system status",
                "sensors": "GET /api/sensors/ for sensor data",
                "devices": "GET /api/devices/ for device list"
            }
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'status': 'error',
            'message': 'Endpoint not found',
            'suggestion': 'Visit /api/docs/ for available endpoints'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {error}")
        return jsonify({
            'status': 'error',
            'message': 'Internal server error',
            'suggestion': 'Check logs or contact administrator'
        }), 500
    
    return app

# Create app instance
app = create_app()

if __name__ == '__main__':
    config_obj = Config()
    
    print("🚀 Starting Kampung Tani IoT API v2.0 - Modular Edition")
    print(f"📚 Swagger Documentation: http://localhost:{config_obj.API_PORT}/api/docs/")
    print(f"🏥 Health Check: http://localhost:{config_obj.API_PORT}/api/health")
    print("🏗️  Modular architecture with separation of concerns")
    print("🔄 Enhanced with comprehensive Swagger documentation")
    
    app.run(
        host=config_obj.API_HOST,
        port=config_obj.API_PORT,
        debug=config_obj.FLASK_DEBUG
    )