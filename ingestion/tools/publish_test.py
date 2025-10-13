"""Simple MQTT publisher for testing ingestion pipeline.

Usage:
  - Install paho-mqtt in your environment: pip install paho-mqtt
  - Update BROKER, PORT, TOPIC, and optionally USER/PASS below or via env vars.
  - Run: python tools/publish_test.py

It publishes a single example payload that matches the parser expectations.
"""

import json
import os
import time
import uuid

import paho.mqtt.client as mqtt

BROKER = os.getenv("MQTT_BROKER", "localhost")
PORT = int(os.getenv("MQTT_PORT", 1883))
TOPIC = os.getenv("MQTT_TOPIC", "kampoengtani/GTW-F4FBF3/SEM225-01/data")
USER = os.getenv("MQTT_USER")
PASS = os.getenv("MQTT_PASS")

payload = {
    # Payload formatted like real device: 'd' array of {tag, value} and 'ts' timestamp in Z
    "d": [
        {"tag": "SEM225:Temperature", "value": 250},
        {"tag": "SEM225:Moisture", "value": 450},
    ],
    "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "metadata": {"battery": 88},
}

client = mqtt.Client(client_id=f"test-publisher-{uuid.uuid4()}")
if USER:
    client.username_pw_set(USER, PASS)


def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker", BROKER, "rc=", rc)


client.on_connect = on_connect
client.connect(BROKER, PORT, 60)
client.loop_start()

print("Publishing to topic:", TOPIC)
client.publish(TOPIC, json.dumps(payload), qos=1)

# give broker some time to process
time.sleep(1)
client.loop_stop()
client.disconnect()
print("Published payload:")
print(json.dumps(payload, indent=2))
