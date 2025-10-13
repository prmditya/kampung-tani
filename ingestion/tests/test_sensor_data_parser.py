from app.parsers.sensor_data_parser import SensorDataParser

parser = SensorDataParser()

payload = {
    "d": [
        {"tag": "SEM225:Temperature", "value": 250},
        {"tag": "SEM225:Moisture", "value": 450},
    ],
    "ts": "2025-10-10T10:00:00Z",
}

result = parser.parse("GW-TEST", "SEM225-01", payload)
print(result)
