#!/usr/bin/env python3
"""
MQTT Listener for Kampung Tani IoT API
Compatible with FastAPI backend
"""

import json
import logging
import time
import signal
import sys
from typing import Dict, Any

import paho.mqtt.client as mqtt

# Use FastAPI configuration
from app.core.config import get_settings
from app.core.database import get_db_cursor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global flag for graceful shutdown
running = True


def signal_handler(signum, frame):
    """Handle shutdown signals"""
    global running
    logger.info("Received shutdown signal. Stopping MQTT listener...")
    running = False


def on_connect(client, userdata, flags, rc):
    """Callback for when the client receives a CONNACK response from the server."""
    if rc == 0:
        logger.info("Connected to MQTT broker successfully")
        settings = get_settings()
        
        # Subscribe to configured topics
        for topic in settings.MQTT_TOPICS:
            client.subscribe(topic)
            logger.info(f"Subscribed to topic: {topic}")
    else:
        logger.error(f"Failed to connect to MQTT broker. Return code: {rc}")


def on_message(client, userdata, msg):
    """Callback for when a PUBLISH message is received from the server."""
    try:
        topic = msg.topic
        payload = msg.payload.decode('utf-8')
        
        logger.info(f"Received message on topic '{topic}': {payload}")
        
        # Parse JSON payload
        try:
            data = json.loads(payload)
        except json.JSONDecodeError:
            logger.warning(f"Invalid JSON payload: {payload}")
            return
        
        # Process new format SEM225 sensor data
        if 'd' in data and 'ts' in data:
            process_sem225_data(topic, data)
        
        # Process legacy sensor data
        elif topic.startswith('sensors/') and topic.endswith('/data'):
            process_sensor_data(topic, data)
        
        # Process device status
        elif topic.startswith('devices/') and topic.endswith('/status'):
            process_device_status(topic, data)
        
        else:
            logger.warning(f"Unknown topic pattern: {topic}")
            
    except Exception as e:
        logger.error(f"Error processing MQTT message: {e}")


def process_sem225_data(topic: str, data: Dict[str, Any]):
    """Process SEM225 format sensor data"""
    try:
        # Extract sensor readings from 'd' array
        sensor_readings = data.get('d', [])
        timestamp = data.get('ts')
        
        if not sensor_readings:
            logger.warning("No sensor readings found in SEM225 data")
            return
        
        # Group readings by device (extract device name from tag)
        device_readings = {}
        
        for reading in sensor_readings:
            tag = reading.get('tag', '')
            value = reading.get('value')
            
            if ':' in tag:
                # Extract device name and sensor type from tag (e.g., "SEM225:Temperature")
                device_name, sensor_type = tag.split(':', 1)
                
                if device_name not in device_readings:
                    device_readings[device_name] = []
                
                device_readings[device_name].append({
                    'sensor_type': sensor_type,
                    'value': value,
                    'timestamp': timestamp
                })
        
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
                # Create new device
                cursor.execute(
                    """
                    INSERT INTO devices (name, device_type, status, location, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, NOW(), NOW())
                    RETURNING id
                    """,
                    (device_name, 'soil_sensor', 'online', 'field')
                )
                device_id = cursor.fetchone()[0]
                logger.info(f"Created new device: {device_name} with ID {device_id}")
            else:
                device_id = device_row[0]
                # Update device status to online
                cursor.execute(
                    "UPDATE devices SET status = %s, updated_at = NOW() WHERE id = %s",
                    ('online', device_id)
                )
            
        # Save each sensor reading
        for reading in readings:
            sensor_type = reading['sensor_type']
            raw_value = reading['value']
            
            # Apply scaling factor based on sensor type
            value = apply_sensor_scaling(sensor_type, raw_value)
            
            # Determine unit based on sensor type
            unit = get_sensor_unit(sensor_type)
            
            # Skip system readings
            if sensor_type.startswith('#SYS_') or 'Calibration' in sensor_type or 'Coefficient' in sensor_type:
                continue
            
            try:
                # Insert sensor data
                cursor.execute(
                    """
                    INSERT INTO sensor_data (device_id, sensor_type, value, unit, timestamp)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (device_id, sensor_type, value, unit, timestamp or 'NOW()')
                )
                logger.info(f"Inserted sensor data: {sensor_type} = {value} {unit}")
            except Exception as e:
                logger.error(f"Error inserting sensor data {sensor_type}: {e}")
                raise            logger.info(f"Saved {len(readings)} readings for device {device_name}")
            
    except Exception as e:
        logger.error(f"Error saving device readings for {device_name}: {e}")


def apply_sensor_scaling(sensor_type: str, raw_value: float) -> float:
    """Apply scaling factor to sensor values based on sensor type"""
    
    # Sensors that need to be divided by 10
    divide_by_10_sensors = {
        'Temperature',
        'Moisture', 
        'PH',
        'Humidity',
        'TDS',
        'Salinity'
    }
    
    # Sensors that don't need scaling (keep original value)
    no_scaling_sensors = {
        'Nitrogen',
        'Phosphorus', 
        'Potassium',
        'Conductivity',
        'Device_Address',
        'Device_Baud_Rate'
    }
    
    if sensor_type in divide_by_10_sensors:
        return raw_value / 10.0
    elif sensor_type in no_scaling_sensors:
        return raw_value
    else:
        # Default: divide by 10 for unknown sensors (except calibration/coefficient values)
        if 'Calibration' not in sensor_type and 'Coefficient' not in sensor_type:
            return raw_value / 10.0
        return raw_value


def get_sensor_unit(sensor_type: str) -> str:
    """Get appropriate unit for sensor type"""
    sensor_units = {
        'Temperature': '°C',
        'Moisture': '%',
        'Humidity': '%',
        'PH': 'pH',
        'Conductivity': 'μS/cm',
        'TDS': 'ppm',
        'Salinity': 'psu',
        'Nitrogen': 'mg/kg',
        'Phosphorus': 'mg/kg',
        'Potassium': 'mg/kg',
        'Device_Address': '',
        'Device_Baud_Rate': 'bps'
    }
    
    return sensor_units.get(sensor_type, '')


def process_sensor_data(topic: str, data: Dict[str, Any]):
    """Process incoming sensor data"""
    try:
        # Extract device_id from topic (sensors/{device_id}/data)
        device_id = topic.split('/')[1]
        
        # Validate required fields
        required_fields = ['sensor_type', 'value']
        for field in required_fields:
            if field not in data:
                logger.warning(f"Missing required field '{field}' in sensor data")
                return
        
        # Insert sensor data into database
        with get_db_cursor() as cursor:
            # Verify device exists
            cursor.execute("SELECT id FROM devices WHERE id = %s", (device_id,))
            if not cursor.fetchone():
                logger.warning(f"Device {device_id} not found in database")
                return
            
            # Insert sensor data
            cursor.execute(
                """
                INSERT INTO sensor_data (device_id, sensor_type, value, unit, metadata, timestamp)
                VALUES (%s, %s, %s, %s, %s, NOW())
                """,
                (
                    device_id,
                    data['sensor_type'],
                    data['value'],
                    data.get('unit'),
                    json.dumps(data.get('metadata', {}))
                )
            )
            
            logger.info(f"Saved sensor data for device {device_id}: {data['sensor_type']} = {data['value']}")
            
    except Exception as e:
        logger.error(f"Error processing sensor data: {e}")


def process_device_status(topic: str, data: Dict[str, Any]):
    """Process device status updates"""
    try:
        # Extract device_id from topic (devices/{device_id}/status)
        device_id = topic.split('/')[1]
        
        # Validate status field
        if 'status' not in data:
            logger.warning("Missing 'status' field in device status update")
            return
        
        status = data['status']
        valid_statuses = ['online', 'offline', 'maintenance']
        
        if status not in valid_statuses:
            logger.warning(f"Invalid device status: {status}")
            return
        
        # Update device status in database
        with get_db_cursor() as cursor:
            cursor.execute(
                """
                UPDATE devices 
                SET status = %s, updated_at = NOW()
                WHERE id = %s
                """,
                (status, device_id)
            )
            
            if cursor.rowcount > 0:
                logger.info(f"Updated device {device_id} status to: {status}")
            else:
                logger.warning(f"Device {device_id} not found for status update")
                
    except Exception as e:
        logger.error(f"Error processing device status: {e}")


def on_disconnect(client, userdata, rc):
    """Callback for when the client disconnects from the broker."""
    if rc != 0:
        logger.warning("Unexpected MQTT disconnection. Will auto-reconnect")
    else:
        logger.info("Disconnected from MQTT broker")


def main():
    """Main MQTT listener function"""
    global running
    
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Get configuration
    settings = get_settings()
    
    # Create MQTT client
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect
    
    # Configure authentication if provided
    if settings.MQTT_USERNAME and settings.MQTT_PASSWORD:
        client.username_pw_set(settings.MQTT_USERNAME, settings.MQTT_PASSWORD)
    
    try:
        # Connect to MQTT broker
        logger.info(f"Connecting to MQTT broker at {settings.MQTT_BROKER}:{settings.MQTT_PORT}")
        client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, 60)
        
        # Start the network loop in a separate thread
        client.loop_start()
        
        # Keep the main thread alive
        logger.info("MQTT listener started. Press Ctrl+C to stop.")
        while running:
            time.sleep(1)
        
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    except Exception as e:
        logger.error(f"MQTT listener error: {e}")
    finally:
        # Cleanup
        logger.info("Shutting down MQTT listener...")
        client.loop_stop()
        client.disconnect()
        logger.info("MQTT listener stopped")


if __name__ == "__main__":
    main()