import os
import sys

sys.path.append(os.getcwd())
from app.core.database import SessionLocal
from sqlalchemy import text


def main():
    s = SessionLocal()
    try:
        print("Tables present (public schema):")
        tables = s.execute(
            text(
                "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
            )
        ).fetchall()
        for t in tables:
            print(" ", t[0])

        for tbl in [
            "users",
            "gateways",
            "gateway_assignments",
            "sensors",
            "sensor_data",
            "farms",
            "farmers",
        ]:
            print(f"\n{tbl} count:")
            try:
                cnt = s.execute(text(f"SELECT COUNT(*) FROM {tbl}")).scalar()
                print(" ", cnt)
            except Exception as e:
                print("  ERROR:", e)
    finally:
        s.close()


if __name__ == "__main__":
    main()
