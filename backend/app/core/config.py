"""
FastAPI Configuration with Proper Environment Variable Management
Follows DRY and SOLID principles with secure configuration loading
"""

from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import List, Optional
from functools import lru_cache
from pathlib import Path
import os


class Settings(BaseSettings):
    """
    Application settings with proper environment variable support
    Loads from .env files in order: .env (global) -> .env.local (overrides)
    """

    # Application Settings (from .env)
    APP_NAME: str = Field(default="Kampung Tani IoT Backend")
    APP_VERSION: str = Field(default="3.0.0")
    VERSION: str = Field(default="3.0.0")  # Backward compatibility
    DEBUG: bool = Field(default=False)
    LOG_LEVEL: str = Field(default="INFO")

    # Database Configuration (from .env)
    POSTGRES_HOST: str = Field(default="db")
    POSTGRES_PORT: int = Field(default=5432)
    POSTGRES_DB: str = Field(default="kampung_tani_db")
    POSTGRES_USER: str = Field(default="kampung_tani")
    POSTGRES_PASSWORD: str = Field(default="secure_password")
    DATABASE_URL: Optional[str] = Field(default=None)

    # JWT Configuration (SENSITIVE - from .env)
    JWT_SECRET_KEY: str = Field(..., min_length=32)
    JWT_ALGORITHM: str = Field(default="HS256")
    JWT_ACCESS_TOKEN_EXPIRE_HOURS: int = Field(default=24)

    # MQTT Configuration (from .env)
    MQTT_BROKER: str = Field(default="host.docker.internal")
    MQTT_PORT: int = Field(default=1883)
    MQTT_KEEPALIVE: int = Field(default=60)
    MQTT_CLIENT_ID: str = Field(default="kampungtani_backend")
    MQTT_TOPICS: str = Field(default="sensors/+/data")

    # API Configuration
    API_PREFIX: str = Field(default="/api")
    DOCS_URL: str = Field(default="/api/docs")
    REDOC_URL: str = Field(default="/api/redoc")

    # CORS Configuration (from .env)
    ALLOWED_ORIGINS: str = Field(default="http://localhost:3000")

    @property
    def database_url(self) -> str:
        """Construct database URL from components"""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as a list"""
        return [
            origin.strip()
            for origin in self.ALLOWED_ORIGINS.split(",")
            if origin.strip()
        ]

    @property
    def mqtt_topics_list(self) -> List[str]:
        """Get MQTT topics as a list"""
        return [topic.strip() for topic in self.MQTT_TOPICS.split(",") if topic.strip()]

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        """Validate JWT secret strength"""
        if len(v) < 32:
            raise ValueError("JWT secret key must be at least 32 characters long")
        weak_secrets = ["secret", "password", "admin", "test", "your-secret-key"]
        if any(weak in v.lower() for weak in weak_secrets):
            raise ValueError("JWT secret key appears to be a default/weak value")
        return v

    @field_validator("LOG_LEVEL")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate log level"""
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v.upper() not in valid_levels:
            raise ValueError(f"Log level must be one of: {valid_levels}")
        return v.upper()

    class Config:
        # Load environment variables from files in order
        env_file = [
            Path(__file__).parent.parent.parent / ".env",  # Global config
            Path(__file__).parent.parent / ".env.local",  # Backend-specific overrides
        ]
        env_file_encoding = "utf-8"
        case_sensitive = True
        validate_assignment = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Global settings instance
settings = get_settings()
