#!/bin/bash

# Start script for backend services

echo "Starting Kampung Tani Backend Services..."

# Start MQTT Listener in background
echo "Starting MQTT Listener..."
python mqtt_listener.py &

# Start FastAPI server in foreground
echo "Starting FastAPI Server..."
exec uvicorn main:app --host 0.0.0.0 --port 5000