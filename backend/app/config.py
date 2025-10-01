"""
Configuration module for Kampung Tani IoT API
"""
import os
from datetime import timezone, timedelta

class Config:
    """Base configuration class"""
    
    # Database Configuration
    DB_HOST = os.environ.get('DB_HOST', 'db')
    DB_PORT = os.environ.get('DB_PORT', '5432')
    DB_NAME = os.environ.get('DB_NAME', 'kampungtani')
    DB_USER = os.environ.get('DB_USER', 'kampungtani')
    DB_PASS = os.environ.get('DB_PASS', 'kampungtani')
    
    # Timezone Configuration
    WIB_TIMEZONE = timezone(timedelta(hours=7))
    
    # Status Thresholds
    OFFLINE_THRESHOLD_MINUTES = 5
    RESTART_THRESHOLD_MINUTES = 1
    
    # API Configuration
    API_PORT = int(os.environ.get('API_PORT', 5000))
    API_HOST = os.environ.get('API_HOST', '0.0.0.0')
    FLASK_DEBUG = os.environ.get('FLASK_DEBUG', '1') == '1'
    
    # Pagination limits
    DEFAULT_PAGE_SIZE = 50
    MAX_PAGE_SIZE = 200

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True

# Config mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}