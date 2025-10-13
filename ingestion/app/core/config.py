from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Kampung Tani Ingestion"
    VERSION: str = "1.0.0"

    # Database
    DATABASE_URL: str = Field(
        default="postgresql://admin:admin123@localhost:5432/kampoeng_tani_test"
    )

    # MQTT
    MQTT_BROKER: str = Field(default="localhost")
    MQTT_PORT: int = Field(default=1883)
    MQTT_USERNAME: str = Field(default="")
    MQTT_PASSWORD: str = Field(default="")
    MQTT_KEEPALIVE: int = Field(default=60)

    # Topics
    MQTT_TOPIC_PATTERN: str = Field(default="kampoengtani/+/+/data")

    # Monitoring
    OFFLINE_THRESHOLD_MINUTES: int = Field(default=5)

    # Logging
    LOG_LEVEL: str = Field(default="INFO")

    model_config = SettingsConfigDict(
        env_file=".env.local",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
        validate_default=True,
    )


settings = Settings()
