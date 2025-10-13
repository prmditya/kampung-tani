from app.services.ingestion_service import IngestionService
from app.utils.logger import logger
from app.core.database import get_db


class MessageHandler:
    """Handler for process MQTT message"""

    def __init__(self):
        self.ingestion = IngestionService()

    def handle_message(self, topic: str, payload: bytes):
        try:
            with get_db() as db:
                saved_count = self.ingestion.ingest(db, topic, payload)
                if saved_count:
                    logger.info(f"Processed message from topic: {topic}")
                else:
                    logger.warning(f"No data saved from topic: {topic}")
        except Exception as e:
            logger.error(f"Error handling message from topic {topic}: {e}")
