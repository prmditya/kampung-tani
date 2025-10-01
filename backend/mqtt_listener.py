import os
import json
import psycopg2
import paho.mqtt.client as mqtt
import threading
import time
from datetime import datetime, timedelta, timezone

# Environment configuration
DB_HOST = os.environ.get('DB_HOST', 'db')
DB_PORT = os.environ.get('DB_PORT', '5432')
DB_NAME = os.environ.get('DB_NAME', 'kampungtani')
DB_USER = os.environ.get('DB_USER', 'kampungtani')
DB_PASS = os.environ.get('DB_PASS', 'kampungtani')
MQTT_HOST = os.environ.get('MQTT_HOST', 'host.docker.internal')
MQTT_PORT = int(os.environ.get('MQTT_PORT', 1883))
MQTT_TOPIC = os.environ.get('MQTT_TOPIC', 'sensor/ecu1051/data')
MQTT_CLIENT_ID = os.environ.get('MQTT_CLIENT_ID', 'kampungtani_listener')
LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')

# Indonesia Timezone (WIB = UTC+7)
WIB_TIMEZONE = timezone(timedelta(hours=7))

def get_wib_now():
    """Get current time in WIB (UTC+7)"""
    return datetime.now(WIB_TIMEZONE)

def map_baud_rate(baud_code):
    """Convert baud rate code to actual baud rate value"""
    baud_rate_map = {
        0: 2400,
        1: 4800,
        2: 9600
    }
    return baud_rate_map.get(baud_code, 9600)  # Default to 9600 if unknown

def parse_payload(payload):
    # Mapping tag ke sensor type untuk schema baru
    tag_map = {
        'SEM225:Moisture': 'moisture',
        'SEM225:Temperature': 'temperature', 
        'SEM225:Conductivity': 'conductivity',
        'SEM225:PH': 'ph',
        'SEM225:Nitrogen': 'nitrogen',
        'SEM225:Phosphorus': 'phosphorus',
        'SEM225:Potassium': 'potassium',
        'SEM225:Salinity': 'salinity',
        'SEM225:TDS': 'tds',
    }
    
    # Mapping untuk calibration values
    calibration_map = {
        'SEM225:Temperature_Calibration_Value': 'temperature_cal',
        'SEM225:Water_Content_Calibration_Value': 'moisture_cal',
        'SEM225:Conductivity_Calibration_Value': 'conductivity_cal',
        'SEM225:PH_Calibration_Value': 'ph_cal',
        'SEM225:Nitrogen_Content_Calibration_Value': 'nitrogen_cal',
        'SEM225:Phosphorus_Content_Calibration_Value': 'phosphorus_cal',
        'SEM225:Potassium_Content_Calibration_Value': 'potassium_cal',
    }
    
    measurements = []
    calibrations = []
    device_address = None
    device_baud_rate = None
    uptime_seconds = None
    device_name = None
    ts = None
    
    # Parse payload berdasarkan format baru
    if 'deviceName' in payload and 'tags' in payload:
        # Format: {"deviceName": "ECU-1051-01", "tags": [{"name": "SEM225:Moisture", "value": 45.5}]}
        device_name = payload.get('deviceName')
        for tag_data in payload.get('tags', []):
            tag_name = tag_data.get('name')
            tag_value = tag_data.get('value')
            if tag_name in tag_map and tag_value is not None:
                # Tidak dibagi 10 untuk conductivity, nitrogen, phosphorus, potassium
                sensor_type = tag_map[tag_name]
                if sensor_type in ['conductivity', 'nitrogen', 'phosphorus', 'potassium']:
                    value = float(tag_value)  # Tidak dibagi 10
                else:
                    value = float(tag_value) / 10.0  # Dibagi 10 untuk sensor lainnya
                
                measurements.append({
                    'type': sensor_type,
                    'value': value
                })
            elif tag_name in calibration_map and tag_value is not None:
                calibrations.append({
                    'type': calibration_map[tag_name],
                    'value': float(tag_value) / 10.0  # Nilai calibration juga dibagi 10
                })
            elif tag_name == 'SEM225:Device_Address':
                device_address = int(tag_value)
            elif tag_name == 'SEM225:Device_Baud_Rate':
                device_baud_rate = map_baud_rate(int(tag_value))
    elif 'd' in payload:
        # Format ECU-1051: {"d": [{"tag": "SEM225:Moisture", "value": 45.5}], "ts": "2025-09-29T01:39:00Z"}
        for item in payload.get('d', []):
            tag = item.get('tag')
            value = item.get('value')
            
            if value is None:
                continue
                
            if tag in tag_map:
                # Tidak dibagi 10 untuk conductivity, nitrogen, phosphorus, potassium
                sensor_type = tag_map[tag]
                if sensor_type in ['conductivity', 'nitrogen', 'phosphorus', 'potassium']:
                    sensor_value = float(value)  # Tidak dibagi 10
                else:
                    sensor_value = float(value) / 10.0  # Dibagi 10 untuk sensor lainnya
                    
                measurements.append({
                    'type': sensor_type,
                    'value': sensor_value
                })
            elif tag in calibration_map:
                calibrations.append({
                    'type': calibration_map[tag],
                    'value': float(value) / 10.0  # Nilai calibration juga dibagi 10
                })
            elif tag == 'SEM225:Device_Address':
                device_address = int(value)
            elif tag == 'SEM225:Device_Baud_Rate':
                device_baud_rate = map_baud_rate(int(value))
            elif tag == '#SYS_UPTIME':
                uptime_seconds = float(value)
        
        # Generate device name berdasarkan address jika tidak ada
        if device_address and not device_name:
            device_name = f"ECU-1051-Address-{device_address}"
    
    # Ambil timestamp
    ts = payload.get('ts') or payload.get('timestamp')
    
    # Return dict dengan data yang diparsing
    if measurements or calibrations or device_name:
        return {
            'measurements': measurements,
            'calibrations': calibrations,
            'device_name': device_name or f"ECU-1051-Unknown-{hash(str(payload))%1000}",
            'device_address': device_address,
            'device_baud_rate': device_baud_rate,
            'uptime_seconds': uptime_seconds,
            'timestamp': ts
        }
    
    return None

def get_or_create_device(device_name, device_address=None, device_baud_rate=None):
    """Get device_id berdasarkan nama device, atau buat device baru jika belum ada"""
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS
        )
        cur = conn.cursor()
        
        # Cek device berdasarkan nama atau address
        if device_address:
            cur.execute("SELECT id, name FROM devices WHERE address = %s OR name = %s", (device_address, device_name))
        else:
            cur.execute("SELECT id, name FROM devices WHERE name = %s", (device_name,))
        
        result = cur.fetchone()
        
        if result:
            device_id = result[0]
            existing_name = result[1]
            
            # Update device info jika ada perubahan (using WIB time)
            if device_address or device_baud_rate:
                wib_now = get_wib_now()
                cur.execute(
                    """
                    UPDATE devices 
                    SET name = %s, address = COALESCE(%s, address), baud_rate = COALESCE(%s, baud_rate), updated_at = %s
                    WHERE id = %s
                    """,
                    (device_name, device_address, device_baud_rate, wib_now.astimezone(timezone.utc), device_id)
                )
                conn.commit()
                print(f"Updated device: {existing_name} -> {device_name} (ID: {device_id})")
        else:
            # Buat device baru dengan user_id = 1 (admin) sebagai default
            cur.execute(
                """
                INSERT INTO devices (user_id, name, address, baud_rate, type, status)
                VALUES (1, %s, %s, %s, 'ECU-1051', 'online')
                RETURNING id
                """,
                (device_name, device_address or 1, device_baud_rate or 9600)
            )
            device_id = cur.fetchone()[0]
            conn.commit()
            print(f"Created new device: {device_name} with ID: {device_id}")
        
        cur.close()
        conn.close()
        return device_id
        
    except Exception as e:
        print(f"Error getting/creating device: {e}")
        return 1  # fallback ke device_id = 1

def update_device_status(device_id, uptime_seconds):
    """Update device status berdasarkan uptime dan last_seen"""
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS
        )
        cur = conn.cursor()
        
        # Tentukan status device (using WIB time)
        current_time = get_wib_now()
        
        # Cek status sebelumnya
        cur.execute("SELECT status, uptime_seconds FROM devices WHERE id = %s", (device_id,))
        result = cur.fetchone()
        
        if result:
            previous_status = result[0]
            previous_uptime = result[1] or 0
            
            # Tentukan status baru
            new_status = 'online'
            
            # Jika uptime berkurang secara signifikan, device mungkin restart
            if uptime_seconds < previous_uptime - 10:  # 10 detik threshold
                new_status = 'restarted'
                print(f"Device {device_id} restarted - uptime decreased from {previous_uptime} to {uptime_seconds}")
            
            # Update device status (store as UTC in database)
            cur.execute(
                """
                UPDATE devices 
                SET status = %s, last_seen = %s, uptime_seconds = %s, updated_at = %s
                WHERE id = %s
                """,
                (new_status, current_time.astimezone(timezone.utc), uptime_seconds, current_time.astimezone(timezone.utc), device_id)
            )
            conn.commit()
            print(f"Device {device_id} status: {new_status}, uptime: {uptime_seconds}s")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error updating device status: {e}")

def mark_devices_offline():
    """Mark devices as offline if they haven't been seen for a while"""
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS
        )
        cur = conn.cursor()
        
        # Mark devices offline if last_seen > 5 minutes ago (using WIB time calculation)
        wib_now = get_wib_now()
        offline_threshold = wib_now - timedelta(minutes=5)
        
        cur.execute(
            """
            UPDATE devices 
            SET status = 'offline' 
            WHERE status != 'offline' 
            AND (last_seen IS NULL OR last_seen < %s)
            RETURNING id, name
            """,
            (offline_threshold.astimezone(timezone.utc),)
        )
        
        offline_devices = cur.fetchall()
        if offline_devices:
            for device_id, device_name in offline_devices:
                print(f"Marked device {device_name} (ID: {device_id}) as offline")
        
        conn.commit()
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error marking devices offline: {e}")

def save_sensor_data(device_id, measurements):
    """Simpan sensor measurements ke database"""
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS
        )
        cur = conn.cursor()
        
        # Insert sensor_data dengan WIB timestamp
        wib_now = get_wib_now()
        cur.execute(
            "INSERT INTO sensor_data (device_id, created_at) VALUES (%s, %s) RETURNING id",
            (device_id, wib_now.astimezone(timezone.utc))
        )
        sensor_data_id = cur.fetchone()[0]
        
        # Insert measurements
        for measurement in measurements:
            cur.execute(
                "INSERT INTO sensor_measurements (sensor_data_id, type, value) VALUES (%s, %s, %s)",
                (sensor_data_id, measurement['type'], measurement['value'])
            )
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"Saved {len(measurements)} measurements for device {device_id}")
        
    except Exception as e:
        print(f"Error saving sensor data: {e}")

def save_calibration_data(device_id, calibrations):
    """Simpan calibration data ke database"""
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS
        )
        cur = conn.cursor()
        
        wib_now = get_wib_now()
        
        for cal in calibrations:
            # Check if calibration already exists
            cur.execute(
                """
                SELECT id FROM sensor_calibrations 
                WHERE device_id = %s AND sensor_type = %s
                """,
                (device_id, cal['type'])
            )
            existing = cur.fetchone()
            
            if existing:
                # Update existing calibration
                cur.execute(
                    """
                    UPDATE sensor_calibrations 
                    SET param_value = %s, updated_at = %s
                    WHERE id = %s
                    """,
                    (cal['value'], wib_now.astimezone(timezone.utc), existing[0])
                )
            else:
                # Insert new calibration  
                cur.execute(
                    """
                    INSERT INTO sensor_calibrations (device_id, sensor_type, param_name, param_value, updated_at)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (device_id, cal['type'], cal['type'], cal['value'], wib_now.astimezone(timezone.utc))
                )
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"Saved {len(calibrations)} calibrations for device {device_id}")
        
    except Exception as e:
        print(f"Error saving calibration data: {e}")

def on_connect(client, userdata, flags, rc, properties=None):
    print(f"DEBUG: Connected to MQTT broker with result code {rc}")
    if rc == 0:
        print(f"DEBUG: Successfully connected to MQTT broker")
        client.subscribe(MQTT_TOPIC)
        print(f"DEBUG: Subscribed to topic: {MQTT_TOPIC}")
    else:
        print(f"ERROR: Failed to connect to MQTT broker with code {rc}")

def on_disconnect(client, userdata, rc, properties=None):
    print(f"DEBUG: Disconnected from MQTT broker with result code {rc}")

def on_message(client, userdata, msg):
    try:
        topic = msg.topic
        payload_str = msg.payload.decode('utf-8')
        
        print(f"DEBUG: Received from {topic}: {payload_str}")
        
        # Parse JSON payload
        try:
            payload = json.loads(payload_str)
        except json.JSONDecodeError as e:
            print(f"ERROR: Failed to parse JSON payload: {e}")
            print(f"Raw payload: {payload_str}")
            return
        
        # Parse payload ECU-1051
        parsed_data = parse_payload(payload)
        
        if parsed_data:
            print(f"DEBUG: Parsed data: {parsed_data}")
            
            # Get atau create device dengan info address dan baud rate
            device_id = get_or_create_device(
                parsed_data['device_name'],
                parsed_data.get('device_address'),
                parsed_data.get('device_baud_rate')
            )
            
            # Update device status jika ada uptime
            if parsed_data.get('uptime_seconds') is not None:
                update_device_status(device_id, parsed_data['uptime_seconds'])
            
            # Simpan sensor measurements
            if parsed_data.get('measurements'):
                save_sensor_data(device_id, parsed_data['measurements'])
            
            # Simpan calibration data
            if parsed_data.get('calibrations'):
                save_calibration_data(device_id, parsed_data['calibrations'])
            
            print(f"DEBUG: Data saved for device: {parsed_data['device_name']} (ID: {device_id})")
        else:
            print("WARNING: Failed to parse MQTT message")
            
    except Exception as e:
        print(f"ERROR: Error processing MQTT message: {e}")
        print(f"Topic: {topic}, Payload: {payload_str}")
        import traceback
        traceback.print_exc()

def device_monitor_task():
    """Background task untuk monitor device offline"""
    while True:
        try:
            mark_devices_offline()
            time.sleep(60)  # Check setiap 1 menit
        except Exception as e:
            print(f"Error in device monitor task: {e}")
            time.sleep(60)

if __name__ == "__main__":
    print("DEBUG: Starting MQTT Listener...")
    print(f"DEBUG: MQTT Host: {MQTT_HOST}")
    print(f"DEBUG: MQTT Port: {MQTT_PORT}")
    print(f"DEBUG: MQTT Topic: {MQTT_TOPIC}")
    print(f"DEBUG: DB Host: {DB_HOST}")
    
    # Start background task untuk monitoring device
    monitor_thread = threading.Thread(target=device_monitor_task, daemon=True)
    monitor_thread.start()
    print("DEBUG: Device monitoring started in background")
    
    # Start MQTT client with callback API version 2
    try:
        client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
        client.on_connect = on_connect
        client.on_disconnect = on_disconnect
        client.on_message = on_message
        
        print(f"DEBUG: Connecting to MQTT broker at {MQTT_HOST}:{MQTT_PORT}")
        client.connect(MQTT_HOST, MQTT_PORT, 60)
        print(f"DEBUG: Listening to MQTT topic: {MQTT_TOPIC}")
        
        client.loop_forever()
    except Exception as e:
        print(f"ERROR: Failed to start MQTT client: {e}")
        import traceback
        traceback.print_exc()
