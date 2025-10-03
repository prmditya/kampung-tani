"""
FastAPI Core Configuration
Modern, environment-based configuration management
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application Settings
    APP_NAME: str = "Kampung Tani IoT API"
    VERSION: str = "3.0.0"
    DEBUG: bool = False
    
    # Database Configuration
    DATABASE_URL: Optional[str] = None
    DB_HOST: str = "db"  # Docker service name
    DB_PORT: int = 5432
    DB_NAME: str = "kampung_tani"
    DB_USER: str = "kampung_tani_user"
    DB_PASSWORD: str = "kampung_tani_2024"
    
    # JWT Configuration
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_HOURS: int = 168  # 7 days
    
    # MQTT Configuration
    MQTT_BROKER: str = "localhost"
    MQTT_PORT: int = 1883
    MQTT_USERNAME: Optional[str] = None
    MQTT_PASSWORD: Optional[str] = None
    MQTT_TOPICS: list = ["sensors/+/data", "sensor/+/data", "devices/+/status"]
    
    # CORS Configuration
    CORS_ORIGINS: list = ["*"]  # In production, specify exact origins
    
    # API Configuration
    API_PREFIX: str = "/api"
    DOCS_URL: str = "/api/docs"
    REDOC_URL: str = "/api/redoc"
    
    @property
    def database_url(self) -> str:
        """Construct database URL from components"""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()