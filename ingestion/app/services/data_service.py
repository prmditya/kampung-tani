from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.models.gateway import Gateway
from app.models.sensor import Sensor
from app.models.sensor_data import SensorData
from app.models.farm import Farm
from app.models.farmer import Farmer
from app.services.assignment_service import get_active_assignment
from app.utils.logger import logger


class DataService:
    """Database operation service"""

    def save_sensor_readings(
        self,
        db: Session,
        gateway_uid: str,
        sensor_uid: str,
        readings: List[Dict[str, Any]],
    ) -> int:
        """
        Save data to database

        return: Data count that successfully saved into database
        """
        try:
            # 1. Get gateway (must be pre-registered via API)
            gateway = self._get_gateway(db, gateway_uid)
            if not gateway:
                logger.warning(
                    f"Gateway not registered: {gateway_uid} — skipping readings"
                )
                return 0

            # 2. Get or create sensor (sensor may be auto-registered on first message)
            sensor = self._get_or_create_sensor(db, gateway.id, sensor_uid, readings[0])
            if not sensor:
                logger.error(f"Failed get/create sensor: {sensor_uid}")
                return 0

            # 3. Update gateway status
            self._update_gateway_status(db, gateway)

            # 3.5 Determine active assignment (which farm/farmer owns this gateway right now)
            assignment = get_active_assignment(db, gateway.gateway_uid)
            if not assignment:
                logger.warning(
                    f"Gateway {gateway_uid} has no active assignment — not saving readings"
                )
                return 0

            farm_id = getattr(assignment, "farm_id", None)
            # try to get farmer_id from relationship or by query
            farmer_id = None
            try:
                if getattr(assignment, "farm", None) is not None:
                    farmer_id = getattr(assignment.farm, "farmer_id", None)
                else:
                    # fallback: query Farm
                    farm_obj = db.query(Farm).filter(Farm.id == farm_id).first()
                    if farm_obj:
                        farmer_id = getattr(farm_obj, "farmer_id", None)
            except Exception:
                farmer_id = None

            # 4. Save sensor data
            saved_count = 0
            for reading in readings:
                try:
                    # merge metadata if parser already provided some
                    base_meta = reading.get("metadata", {}) or {}
                    base_meta.update(
                        {
                            "source": "mqtt",
                            "raw_value": reading.get("raw_value"),
                            "tag": reading.get("tag"),
                            "farm_id": farm_id,
                            "farmer_id": farmer_id,
                            "assignment_id": getattr(assignment, "id", None),
                        }
                    )

                    sensor_data = SensorData(
                        sensor_id=sensor.id,
                        gateway_id=gateway.id,
                        value=reading["value"],
                        unit=reading.get("unit"),
                        metadata_=base_meta,
                        timestamp=reading["timestamp"],
                    )
                    db.add(sensor_data)
                    saved_count += 1
                except Exception as e:
                    logger.error(f"Error saving reading: {e}")
                    continue

            db.commit()
            logger.info(f"Saved {saved_count} readings")
            return saved_count

        except Exception as e:
            logger.error(f"Error in save_sensor_readings: {e}")
            db.rollback()
            return 0

    def _get_or_create_gateway(self, db: Session, gateway_uid: str) -> Gateway:
        """Get gateway, kalau tidak ada buat baru"""
        # Do NOT auto-create gateways here. Gateways must be registered via API.
        return db.query(Gateway).filter(Gateway.gateway_uid == gateway_uid).first()

    def _get_or_create_sensor(
        self, db: Session, gateway_id: int, sensor_uid: str, reading: Dict[str, Any]
    ) -> Sensor:
        """Get sensor, if there's none create new one"""
        sensor = db.query(Sensor).filter(Sensor.sensor_uid == sensor_uid).first()

        if sensor:
            # ensure sensor belongs to the gateway
            if sensor.gateway_id != gateway_id:
                logger.warning(
                    f"Sensor {sensor_uid} exists but bound to gateway {sensor.gateway_id} != {gateway_id}"
                )
            return sensor

        # Auto-register sensor based on first message. This allows sensors to be
        # created when the gateway owner has already registered the gateway via API.
        try:
            sensor = Sensor(
                gateway_id=gateway_id,
                sensor_uid=sensor_uid,
                name=reading.get("sensor_uid") or f"{sensor_uid}",
                type=reading.get("sensor_type") or reading.get("type") or "unknown",
                unit=reading.get("unit"),
                status="active",
            )
            db.add(sensor)
            db.flush()
            logger.info(f"Auto-created sensor: {sensor_uid} for gateway {gateway_id}")
            return sensor
        except Exception as e:
            logger.error(f"Error auto-creating sensor {sensor_uid}: {e}")
            return None

    # Backwards-compatible helper names (not used internally)
    def _get_gateway(self, db: Session, gateway_uid: str) -> Gateway:
        return self._get_or_create_gateway(db, gateway_uid)

    def _get_sensor(self, db: Session, gateway_id: int, sensor_uid: str) -> Sensor:
        return self._get_or_create_sensor(db, gateway_id, sensor_uid, {})

    def _update_gateway_status(self, db: Session, gateway: Gateway):
        """Update gateway status and last_seen"""
        gateway.status = "online"
        gateway.last_seen = datetime.now(timezone.utc)
