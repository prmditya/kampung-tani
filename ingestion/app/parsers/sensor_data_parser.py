from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.utils.logger import logger


class SensorDataParser:
    """MQTT Payload Parser"""

    # Mapping Sensor Types
    SENSOR_TYPE_MAP = {
        "temperature": "Temperature",
        "moisture": "Moisture",
        "ph": "PH",
        "conductivity": "Conductivity",
        "tds": "TDS",
        "salinity": "Salinity",
        "nitrogen": "Nitrogen",
        "phosphorus": "Phosphorus",
        "potassium": "Potassium",
        "device_address": "Device_Address",
        "device_baud_rate": "Device_Baud_Rate",
    }

    # Mapping Sensor Units
    SENSOR_UNIT_MAP = {
        "Temperature": "°C",
        "Moisture": "%",
        "PH": "pH",
        "Conductivity": "μS/cm",
        "TDS": "ppm",
        "Salinity": "ppt",
        "Nitrogen": "mg/kg",
        "Phosphorus": "mg/kg",
        "Potassium": "mg/kg",
        "Device_Address": "",
        "Device_Baud_Rate": "bps",
    }

    # Sensor value that need to be scaled
    DIVIDE_BY_10 = {
        "Temperature",
        "Moisture",
        "PH",
        "Humidity",
        "TDS",
        "Salinity",
    }

    def parse(
        self, gateway_uid: str, sensor_uid: str, payload: dict
    ) -> Dict[str, Any]:
        """
        Parse payload MQTT

        Input:
        {
            "d": [
                {"tag": "SEM225:Temperature", "value": 250},
                {"tag": "SEM225:Moisture", "value": 450},
                {"tag": "#SYS_UPTIME", "value": 12345}
            ],
            "ts": "2025-10-10T10:00:00Z"
        }

        Output:
        {
            "readings": [
                {
                    "gateway_uid": "GW-F3E2R3",
                    "sensor_uid": "SEM225-01",
                    "sensor_type": "temperature",
                    "value": 25.0,
                    "raw_value": 250,
                    "unit": "°C",
                    "timestamp": datetime(...),
                    "tag": "SEM225:Temperature"
                },
                ...
            ],
            "uptime_seconds": 12345
        }
        """
        try:
            readings = payload.get("d", [])
            timestamp_str = payload.get("ts")

            if not readings:
                logger.warning("No data in payload")
                return {"readings": [], "uptime_seconds": None}

            # Parse timestamp into datetime (fall back to now utc)
            timestamp = self._parse_timestamp(timestamp_str)

            # Extract SYS_UPTIME before processing other readings
            uptime_seconds = None
            for reading in readings:
                tag = reading.get("tag", "")
                if tag == "#SYS_UPTIME":
                    uptime_seconds = reading.get("value")
                    logger.info(f"Extracted SYS_UPTIME: {uptime_seconds} seconds")
                    break

            # Process every reading
            parsed_data = []
            for reading in readings:
                tag = reading.get("tag", "")
                raw_value = reading.get("value")

                if not tag or raw_value is None:
                    continue

                # Skip system readings
                if self._should_skip(tag):
                    continue

                # Extract sensor type dari tag
                sensor_type = self._extract_type(tag)
                if not sensor_type:
                    continue

                # Apply scaling (bagi 10 kalau perlu)
                value = self._apply_scaling(sensor_type, raw_value)

                # Get unit
                unit = self.SENSOR_UNIT_MAP.get(sensor_type, "")

                parsed_data.append(
                    {
                        "gateway_uid": gateway_uid,
                        "sensor_uid": sensor_uid,
                        "sensor_type": sensor_type,
                        "value": value,
                        "raw_value": raw_value,
                        "unit": unit,
                        "timestamp": timestamp,
                        "tag": tag,
                    }
                )

            return {"readings": parsed_data, "uptime_seconds": uptime_seconds}

        except Exception as e:
            logger.error(f"Error parsing data: {e}")
            return {"readings": [], "uptime_seconds": None}

    def _should_skip(self, tag: str) -> bool:
        """Check apakah reading harus diskip"""
        skip_patterns = ["#SYS_", "Calibration", "Device_Address"]
        return any(p in tag for p in skip_patterns)

    def _parse_timestamp(self, ts: str) -> datetime:
        """Parse ISO timestamp to aware datetime (UTC). If invalid or missing, return now() UTC."""
        if not ts:
            return datetime.now(timezone.utc)

        try:
            # support trailing Z
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            # ensure tz-aware in UTC
            if dt.tzinfo is None:
                return dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        except Exception:
            return datetime.now(timezone.utc)

    def _extract_type(self, tag: str) -> str:
        """Extract sensor type dari tag"""
        # Tag format: "SEM225:Temperature" -> "temperature"
        if ":" not in tag:
            return ""

        _, sensor_name = tag.split(":", 1)
        sensor_type = sensor_name.lower()

        return self.SENSOR_TYPE_MAP.get(sensor_type, "")

    def _apply_scaling(self, sensor_type: str, raw_value: float) -> float:
        """Apply scaling factor"""
        if sensor_type in self.DIVIDE_BY_10:
            return raw_value / 10.0
        return raw_value
