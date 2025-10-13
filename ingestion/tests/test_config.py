from app.core.config import settings

print(f"Projects: {settings.PROJECT_NAME}")
print(f"Database: {settings.DATABASE_URL}")
print(f"MQTT Broker: {settings.MQTT_BROKER}")
print(f"MQTT Port: {settings.MQTT_PORT}")
