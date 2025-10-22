from app.services.ingestion_service import IngestionService
from app.utils.logger import logger
from app.core.database import get_db


class MessageHandler:
    """Handler for process MQTT message"""

    def __init__(self):
        self.ingestion = IngestionService()

    def handle_message(self, topic: str, payload: bytes):
        try:
            logger.info(f"Received message on topic: {topic}")
            logger.debug(f"Payload: {payload.decode('utf-8', errors='ignore')[:200]}")

            with get_db() as db:
                saved_count = self.ingestion.ingest(db, topic, payload)
                if saved_count:
                    logger.info(f"✓ Processed message from topic: {topic}, saved {saved_count} reading(s)")
                else:
                    logger.warning(f"⚠ No data saved from topic: {topic}")
        except Exception as e:
            logger.error(f"✗ Error handling message from topic {topic}: {e}")
            import traceback
            logger.error(traceback.format_exc())
