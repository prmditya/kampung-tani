"""Check DB for recent sensor_data rows and print them.

Usage:
  PYTHONPATH=. venv\Scripts\python tools/check_db.py
"""

from app.core.database import engine
from sqlalchemy import text
import json

SQL = text(
    """
    SELECT sd.id, s.sensor_uid, sd.value, sd.unit, sd.timestamp, sd.metadata
    FROM sensor_data sd
    JOIN sensors s ON s.id = sd.sensor_id
    ORDER BY sd.timestamp DESC
    LIMIT 20;
    """
)

with engine.connect() as conn:
    result = conn.execute(SQL)
    rows = result.fetchall()
    if not rows:
        print("No sensor_data rows found.")
    else:
        for r in rows:
            id, sensor_uid, value, unit, ts, metadata = r
            print(
                f"id={id} sensor={sensor_uid} value={value} unit={unit} ts={ts} metadata={json.dumps(metadata)}"
            )
