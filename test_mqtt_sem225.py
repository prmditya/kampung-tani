#!/usr/bin/env python3
"""
Test script untuk mengirim data MQTT format SEM225
"""

import json
import time
import random
from datetime import datetime, timezone

try:
    import paho.mqtt.client as mqtt
except ImportError:
    print("Please install paho-mqtt: pip install paho-mqtt")
    exit(1)

# MQTT Configuration
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "sensors/sem225/data"

def generate_sem225_data():
    """Generate sample SEM225 data"""
    
    # Base sensor readings with some realistic variations
    # Note: Some values are multiplied by 10 as they will be divided by 10 in the backend
    base_data = {
        "Moisture": random.uniform(200.0, 800.0),  # Will be divided by 10 -> 20-80%
        "Temperature": random.uniform(200.0, 350.0),  # Will be divided by 10 -> 20-35°C
        "Conductivity": random.uniform(0.0, 2000.0),  # No scaling
        "PH": random.uniform(60.0, 85.0),  # Will be divided by 10 -> 6.0-8.5 pH
        "Nitrogen": random.uniform(0.0, 100.0),  # No scaling
        "Phosphorus": random.uniform(0.0, 50.0),  # No scaling
        "Potassium": random.uniform(0.0, 200.0),  # No scaling
        "Salinity": random.uniform(0.0, 100.0),  # Will be divided by 10 -> 0-10 psu
        "TDS": random.uniform(0.0, 10000.0),  # Will be divided by 10 -> 0-1000 ppm
        "Conductivity_Temperature_Coefficient": random.uniform(0.0, 100.0),
        "Salinity_Coefficient": random.uniform(500.0, 600.0),  # Will be divided by 10 -> 50-60
        "TDS_Coefficient": random.uniform(450.0, 550.0),  # Will be divided by 10 -> 45-55
        "Temperature_Calibration_Value": 0.0,
        "Water_Content_Calibration_Value": 0.0,
        "Conductivity_Calibration_Value": 0.0,
        "PH_Calibration_Value": 0.0,
        "Sixteen_Higher_Nitrogen_Content_Coefficient": 0.0,
        "Sixteen_Lower_Nitrogen_Content_Coefficient": 0.0,
        "Nitrogen_Content_Calibration_Value": 0.0,
        "Sixteen_Higher_Phosphorus_Content_Coefficient": 0.0,
        "Phosphorus_Content_Calibration_Value": 0.0,
        "Sixteen_Higher_Potassium_Content_Coefficient": 0.0,
        "Potassium_Content_Calibration_Value": 0.0,
        "Sixteen_Lower_Potassium_Content_Coefficient": 0.0,
        "Device_Address": 1.0,  # No scaling
        "Device_Baud_Rate": 9600.0  # No scaling
    }
    
    # Build d array
    d_array = []
    for sensor_type, value in base_data.items():
        d_array.append({
            "tag": f"SEM225:{sensor_type}",
            "value": round(value, 2)
        })
    
    # Add system uptime
    d_array.append({
        "tag": "#SYS_UPTIME",
        "value": random.uniform(5000.0, 10000.0)
    })
    
    # Build complete payload
    payload = {
        "d": d_array,
        "ts": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    }
    
    return payload

def on_connect(client, userdata, flags, rc):
    """Callback for when the client receives a CONNACK response from the server."""
    if rc == 0:
        print("Connected to MQTT broker successfully")
    else:
        print(f"Failed to connect to MQTT broker. Return code: {rc}")

def on_publish(client, userdata, mid):
    """Callback for when message is published"""
    print(f"Message {mid} published successfully")

def main():
    """Main function to send test data"""
    
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_publish = on_publish
    
    try:
        print(f"Connecting to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}")
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start()
        
        # Wait for connection
        time.sleep(2)
        
        print("Starting to send SEM225 test data...")
        print("Press Ctrl+C to stop")
        
        counter = 0
        while True:
            # Generate and send data
            data = generate_sem225_data()
            
            payload = json.dumps(data, indent=2)
            print(f"\n--- Sending message {counter + 1} ---")
            print(f"Topic: {MQTT_TOPIC}")
            print(f"Payload: {payload}")
            
            result = client.publish(MQTT_TOPIC, payload)
            
            if result.rc == 0:
                print("✓ Message sent successfully")
            else:
                print(f"✗ Failed to send message. Return code: {result.rc}")
            
            counter += 1
            
            # Wait before sending next message
            time.sleep(30)  # Send every 30 seconds
            
    except KeyboardInterrupt:
        print("\nStopping test script...")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.loop_stop()
        client.disconnect()
        print("Disconnected from MQTT broker")

if __name__ == "__main__":
    main()