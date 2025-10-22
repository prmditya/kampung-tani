"""
Quick MQTT Connection Test
Run this to verify MQTT broker connection and message reception
"""
import paho.mqtt.client as mqtt
import time

BROKER = "localhost"
PORT = 1883
TOPIC = "kampoengtani/+/+/data"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✓ Connected to MQTT Broker at {BROKER}:{PORT}")
        result, mid = client.subscribe(TOPIC)
        print(f"✓ Subscription result: {result}, mid: {mid}")
        print(f"✓ Subscribed to: {TOPIC}")
        print("\nWaiting for messages... (Press Ctrl+C to stop)\n")
    else:
        print(f"✗ Failed to connect, return code: {rc}")

def on_message(client, userdata, msg):
    print(f"\n{'='*60}")
    print(f"MESSAGE RECEIVED!")
    print(f"Topic: {msg.topic}")
    print(f"QoS: {msg.qos}")
    print(f"Payload: {msg.payload.decode('utf-8', errors='ignore')}")
    print(f"{'='*60}\n")

def on_subscribe(client, userdata, mid, granted_qos):
    print(f"✓ Subscription confirmed - mid: {mid}, QoS: {granted_qos}")

def on_disconnect(client, userdata, rc):
    if rc != 0:
        print(f"⚠ Unexpected disconnect: {rc}")

def main():
    print("MQTT Connection Test")
    print("="*60)

    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_subscribe = on_subscribe
    client.on_disconnect = on_disconnect

    try:
        print(f"Connecting to {BROKER}:{PORT}...")
        client.connect(BROKER, PORT, 60)
        client.loop_forever()
    except KeyboardInterrupt:
        print("\n\nStopping...")
        client.disconnect()
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == "__main__":
    main()
