import logging
from app.core.database import SessionLocal
from app.models.gateway import Gateway
from app.models.gateway_status_history import GatewayStatusHistory
from sqlalchemy import select, desc

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def repair_history():
    db = SessionLocal()
    try:
        # Find gateways that are 'online'
        gateways = db.query(Gateway).filter(Gateway.status == 'online').all()
        
        fixed_count = 0
        for gateway in gateways:
            # Get latest history
            latest_history = db.query(GatewayStatusHistory)\
                .filter(GatewayStatusHistory.gateway_id == gateway.id)\
                .order_by(desc(GatewayStatusHistory.created_at))\
                .first()
                
            # If latest history is 'offline' (or None), insert an 'online' record
            if not latest_history or latest_history.status != 'online':
                logger.info(f"Fixing gateway {gateway.gateway_uid}: Current=online, History={latest_history.status if latest_history else 'None'}")
                
                new_history = GatewayStatusHistory(
                    gateway_id=gateway.id,
                    status='online',
                    # We don't have exact uptime, but this fixes the status 'stuck' issue
                    uptime_seconds=None 
                )
                db.add(new_history)
                fixed_count += 1
        
        if fixed_count > 0:
            db.commit()
            logger.info(f"Fixed {fixed_count} gateways.")
        else:
            logger.info("No gateways needed repair.")
            
    except Exception as e:
        logger.error(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    repair_history()
