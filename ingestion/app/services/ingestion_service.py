import json
import re
from typing import Any
from app.utils.logger import logger
from app.parsers.sensor_data_parser import SensorDataParser
from app.services.assignment_service import get_active_assignment
from app.services.data_service import DataService


class IngestionService:
    """Orchestrates parsing, validation (assignment) and saving sensor data."""

    def __init__(self):
        self.parser = SensorDataParser()
        self.data_service = DataService()

    def ingest(self, db, topic: str, payload: bytes) -> int:
        """Process a raw MQTT message: parse topic/payload, validate assignment, save readings.

        Returns number of saved readings.
        """
        try:
            # decode and parse JSON
            payload_str = payload.decode("utf-8")
            data = json.loads(payload_str)

            logger.info(f"Ingesting message: {topic}")

            # Extract gateway_uid and sensor_uid from topic
            logger.debug(f"Parsing topic: {topic}")
            match = re.match(r"kampoengtani/([^/]+)/([^/]+)/data", topic)
            if not match:
                logger.warning(f"Invalid topic format: {topic} (expected: kampoengtani/<gateway_uid>/<sensor_uid>/data)")
                return 0

            gateway_uid = match.group(1)
            sensor_uid = match.group(2)
            logger.info(f"Parsed topic - Gateway: {gateway_uid}, Sensor: {sensor_uid}")

            # Validate assignment (ensure gateway currently assigned to a farm)
            assignment = get_active_assignment(db, gateway_uid)
            if not assignment:
                logger.warning(
                    f"Gateway {gateway_uid} has no active assignment — skipping message"
                )
                return 0

            # Parse sensor readings
            parse_result = self.parser.parse(gateway_uid, sensor_uid, data)
            parsed_readings = parse_result.get("readings", [])
            uptime_seconds = parse_result.get("uptime_seconds")

            if not parsed_readings:
                logger.warning("No valid readings to save")
                return 0

            # Optionally attach farm/farmer info to metadata in readings
            for r in parsed_readings:
                r.setdefault("metadata", {})
                try:
                    r["metadata"]["farm_id"] = assignment.farm_id
                except Exception:
                    # assignment may be a plain row; best-effort
                    r["metadata"]["farm_id"] = getattr(assignment, "farm_id", None)

            # Save via data service (pass uptime_seconds for status tracking)
            saved = self.data_service.save_sensor_readings(
                db, gateway_uid, sensor_uid, parsed_readings, uptime_seconds
            )
            return saved

        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error in ingestion: {e}")
            return 0
        except Exception as e:
            logger.error(f"Error in ingestion: {e}")
            import traceback

            logger.error(traceback.format_exc())
            return 0
