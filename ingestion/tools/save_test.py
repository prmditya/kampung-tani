import os
import sys
import traceback

sys.path.append(os.getcwd())
from app.core.database import SessionLocal
from app.services.data_service import DataService

readings = [
    {
        "tag": "SEM225:Temperature",
        "raw_value": 250,
        "value": 25.0,
        "unit": "C",
        "timestamp": None,
        "metadata": {"test": True},
    }
]


def main():
    ds = DataService()
    db = SessionLocal()
    try:
        saved = ds.save_sensor_readings(db, "GTW-F4FBF3", "SEM225-01", readings)
        print("Saved count:", saved)
    except Exception:
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()
