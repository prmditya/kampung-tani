from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(
        text(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='gateway_assignments' ORDER BY ordinal_position;"
        )
    )
    rows = result.fetchall()
    if not rows:
        print("Table gateway_assignments not found or has no columns")
    else:
        for r in rows:
            print(r[0], r[1])
