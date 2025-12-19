from app.core.database import SessionLocal
from app.models.gateway import Gateway
from app.models.gateway_status_history import GatewayStatusHistory
from sqlalchemy import select, desc

db = SessionLocal()
try:
    # Get gateway
    gateway = db.query(Gateway).filter(Gateway.gateway_uid == 'GTW-E8F9F4').first()
    print(f"Gateway Status: {gateway.status}")
    print(f"Last Seen: {gateway.last_seen}")
    
    # Get recent history
    history = db.query(GatewayStatusHistory)\
        .filter(GatewayStatusHistory.gateway_id == gateway.id)\
        .order_by(desc(GatewayStatusHistory.created_at))\
        .limit(5)\
        .all()
        
    print("\nRecent History:")
    for h in history:
        print(f"{h.created_at} - {h.status}")
finally:
    db.close()
