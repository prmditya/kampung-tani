import os
import sys

sys.path.append(os.getcwd())

from app.core.database import SessionLocal
from sqlalchemy import text


def main():
    s = SessionLocal()
    try:
        print("Users:")
        rows = s.execute(text("SELECT id, username FROM users LIMIT 10")).fetchall()
        if not rows:
            print("  <no rows>")
        else:
            for r in rows:
                print(" ", r)

        print("\nGateways:")
        rows = s.execute(
            text("SELECT id, gateway_uid, user_id FROM gateways LIMIT 10")
        ).fetchall()
        if not rows:
            print("  <no rows>")
        else:
            for r in rows:
                print(" ", r)

        print("\nGateway Assignments:")
        rows = s.execute(
            text(
                "SELECT id, gateway_id, farm_id, is_active, start_date, end_date FROM gateway_assignments LIMIT 10"
            )
        ).fetchall()
        if not rows:
            print("  <no rows>")
        else:
            for r in rows:
                print(" ", r)

    except Exception as e:
        print("ERROR:", e)
    finally:
        s.close()


if __name__ == "__main__":
    main()
