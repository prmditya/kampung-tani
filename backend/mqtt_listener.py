#!/usr/bin/env python3
"""
MQTT Listener for Kampung Tani IoT System
Subscribes to MQTT topics and saves sensor data to database
"""

import json
import logging
import time
import threading
from typing import Dict, Any
import paho.mqtt.client as mqtt
from app.core.database import get_db_cursor
from app.core.config import get_settings
from app.services.device_status_service import DeviceStatusService
import signal
import sys
from dotenv import load_dotenv

# Get settings from configuration
settings = get_settings()

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# MQTT Configuration from settings
MQTT_BROKER = settings.MQTT_BROKER
MQTT_PORT = settings.MQTT_PORT
MQTT_KEEPALIVE = settings.MQTT_KEEPALIVE

# MQTT Topics to subscribe to
MQTT_TOPICS = [
    ("sensors/+/data", 0),  # sensors/{device_id}/data format
    ("sensor/+/data", 0),  # sensor/{device_name}/data format (for SEM225)
]


def on_connect(client, userdata, flags, rc):
    """Callback for when the client receives a CONNACK response from the server."""
    if rc == 0:
        logger.info("Connected to MQTT broker")
        # Subscribe to topics
        for topic, qos in MQTT_TOPICS:
            client.subscribe(topic, qos)
            logger.info(f"Subscribed to topic: {topic}")
    else:
        logger.error(f"Failed to connect to MQTT broker with result code {rc}")


def on_message(client, userdata, msg):
    """Callback for when a PUBLISH message is received from the server."""
    try:
        topic = msg.topic
        payload = msg.payload.decode("utf-8")
        logger.info(f"Received message on topic '{topic}': {payload}")

        # Parse JSON payload
        try:
            data = json.loads(payload)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON payload: {e}")
            return

        # Process the sensor data based on topic pattern
        process_sensor_data(topic, data)

    except Exception as e:
        logger.error(f"Error processing MQTT message: {e}")


def process_sensor_data(topic: str, data: Dict[str, Any]):
    """Process incoming sensor data from both formats"""
    try:
        # Check if this is SEM225 format data first
        if "d" in data and "ts" in data:
            # This is SEM225 format, process accordingly
            process_sem225_data(topic, data)
            return

        # Extract device identifier from topic
        # For sensors/{device_id}/data or sensor/{device_name}/data
        topic_parts = topic.split("/")
        if len(topic_parts) >= 3:
            device_identifier = topic_parts[1]
            # Process legacy format data
            process_legacy_data(device_identifier, data)
        else:
            logger.warning(f"Unknown topic pattern: {topic}")

    except Exception as e:
        logger.error(f"Error processing MQTT message: {e}")


def process_sem225_data(topic: str, data: Dict[str, Any]):
    """Process SEM225 format sensor data"""
    try:
        # Extract sensor readings from 'd' array
        sensor_readings = data.get("d", [])
        timestamp = data.get("ts")

        if not sensor_readings:
            logger.warning("No sensor readings found in SEM225 data")
            return

        # Group readings by device (extract device name from tag)
        device_readings = {}

        for reading in sensor_readings:
            tag = reading.get("tag", "")
            value = reading.get("value")

            if ":" in tag:
                # Extract device name and sensor type from tag (e.g., "SEM225:Temperature")
                device_name, sensor_type = tag.split(":", 1)

                if device_name not in device_readings:
                    device_readings[device_name] = []

                device_readings[device_name].append(
                    {"sensor_type": sensor_type, "value": value, "timestamp": timestamp}
                )

        # Save readings for each device
        for device_name, readings in device_readings.items():
            save_device_readings(device_name, readings, timestamp)

    except Exception as e:
        logger.error(f"Error processing SEM225 data: {e}")


def save_device_readings(device_name: str, readings: list, timestamp: str):
    """Save sensor readings to database"""
    try:
        with get_db_cursor() as cursor:
            # Check if device exists, if not create it
            cursor.execute("SELECT id FROM devices WHERE name = %s", (device_name,))
            device_row = cursor.fetchone()

            if not device_row:
                # Create new device with admin user_id (ID: 1)
                cursor.execute(
                    """
                    INSERT INTO devices (user_id, name, device_type, status, location, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
                    RETURNING id
                    """,
                    (
                        1,
                        device_name,
                        "soil_sensor",
                        "online",
                        "field",
                    ),  # user_id = 1 (admin)
                )
                result = cursor.fetchone()
                if result:
                    device_id = result["id"]
                    logger.info(
                        f"Created new device: {device_name} with ID {device_id}"
                    )
                    # Record initial online status in history for new device
                    DeviceStatusService._record_status_change(device_id, 'online')
                else:
                    logger.error(f"Failed to create device {device_name}")
                    return
            else:
                device_id = device_row["id"]
                # Update device status to online and last_seen timestamp
                DeviceStatusService.update_device_last_seen(device_id)

            # Save each sensor reading
            saved_count = 0
            for reading in readings:
                sensor_type = reading["sensor_type"]
                raw_value = reading["value"]

                # Apply scaling factor based on sensor type
                value = apply_sensor_scaling(sensor_type, raw_value)

                # Determine unit based on sensor type
                unit = get_sensor_unit(sensor_type)

                # Skip system readings and calibration values
                if (
                    sensor_type.startswith("#SYS_")
                    or "Calibration" in sensor_type
                    or "Coefficient" in sensor_type
                    or "Device_Address" in sensor_type
                    or "Device_Baud_Rate" in sensor_type
                ):
                    continue

                try:
                    # Parse timestamp if it's ISO format
                    parsed_timestamp = timestamp
                    if timestamp and timestamp != "NOW()":
                        from datetime import datetime

                        try:
                            # Parse ISO format: 2025-10-02T07:37:30Z
                            dt = datetime.fromisoformat(
                                timestamp.replace("Z", "+00:00")
                            )
                            parsed_timestamp = dt.strftime("%Y-%m-%d %H:%M:%S")
                        except Exception:
                            parsed_timestamp = None

                    # Create metadata with device name
                    import json

                    metadata = json.dumps(
                        {
                            "device": device_name,
                            "source": "mqtt",
                            "auto_inserted": True,
                            "inserted_by": "admin",  # Indicate this was auto-inserted by admin
                        }
                    )

                    # Insert sensor data
                    cursor.execute(
                        """
                        INSERT INTO sensor_data (device_id, sensor_type, value, unit, metadata, timestamp)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        """,
                        (
                            device_id,
                            sensor_type.lower(),
                            value,
                            unit,
                            metadata,
                            parsed_timestamp,
                        ),
                    )
                    logger.info(
                        f"Inserted sensor data: {sensor_type} = {value} {unit} (raw: {raw_value})"
                    )
                    saved_count += 1
                except Exception as e:
                    logger.error(f"Error inserting sensor data {sensor_type}: {e}")
                    continue

            logger.info(f"Saved {saved_count} readings for device {device_name}")

    except Exception as e:
        logger.error(f"Error saving device readings for {device_name}: {e}")
        import traceback

        logger.error(f"Traceback: {traceback.format_exc()}")


def apply_sensor_scaling(sensor_type: str, raw_value: float) -> float:
    """Apply scaling factor to sensor values based on sensor type"""

    # Sensors that need to be divided by 10
    divide_by_10_sensors = {
        "Temperature",
        "Moisture",
        "PH",
        "Humidity",
        "TDS",
        "Salinity",
    }

    # Sensors that don't need scaling (keep original value)
    no_scaling_sensors = {
        "Nitrogen",
        "Phosphorus",
        "Potassium",
        "Conductivity",
        "Device_Address",
        "Device_Baud_Rate",
    }

    if sensor_type in divide_by_10_sensors:
        return raw_value / 10.0
    elif sensor_type in no_scaling_sensors:
        return raw_value
    else:
        # Default: divide by 10 for unknown sensors (except calibration/coefficient values)
        if "Calibration" not in sensor_type and "Coefficient" not in sensor_type:
            return raw_value / 10.0
        return raw_value


def get_sensor_unit(sensor_type: str) -> str:
    """Get appropriate unit for sensor type"""
    sensor_units = {
        "Temperature": "°C",
        "Moisture": "%",
        "Humidity": "%",
        "PH": "pH",
        "Conductivity": "μS/cm",
        "TDS": "ppm",
        "Salinity": "psu",
        "Nitrogen": "mg/kg",
        "Phosphorus": "mg/kg",
        "Potassium": "mg/kg",
        "Device_Address": "",
        "Device_Baud_Rate": "bps",
    }

    return sensor_units.get(sensor_type, "")


def process_legacy_data(device_identifier: str, data: Dict[str, Any]):
    """Process legacy format sensor data"""
    try:
        # For backward compatibility with old format
        logger.info(f"Processing legacy data for device {device_identifier}")
        # Implementation for legacy format can be added here if needed

    except Exception as e:
        logger.error(f"Error processing legacy data: {e}")


def on_disconnect(client, userdata, rc):
    """Callback for when the client disconnects from the server."""
    logger.warning(f"Disconnected from MQTT broker with result code {rc}")


def signal_handler(sig, frame):
    """Handle shutdown signals gracefully"""
    logger.info("Received shutdown signal, closing MQTT connection...")
    client.disconnect()
    sys.exit(0)


def device_status_monitor():
    """Background thread to monitor device status and mark offline devices"""
    logger.info("Starting device status monitor thread")

    while True:
        try:
            # Check for offline devices every minute
            time.sleep(60)
            offline_devices = DeviceStatusService.check_offline_devices()

            if offline_devices:
                logger.info(f"Marked {len(offline_devices)} devices as offline")

        except Exception as e:
            logger.error(f"Error in device status monitor: {e}")
            time.sleep(60)  # Wait before retrying


if __name__ == "__main__":
    # Set up signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Start device status monitor thread
    status_monitor_thread = threading.Thread(target=device_status_monitor, daemon=True)
    status_monitor_thread.start()

    # Create MQTT client
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect

    try:
        # Connect to MQTT broker
        logger.info(f"Connecting to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}")
        client.connect(MQTT_BROKER, MQTT_PORT, MQTT_KEEPALIVE)

        # Start the network loop to process callbacks
        client.loop_forever()

    except Exception as e:
        logger.error(f"Error starting MQTT listener: {e}")
        sys.exit(1)
