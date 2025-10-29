from datetime import datetime
from sqlalchemy import or_
from app.models.gateway import Gateway
from app.models.assignment import GatewayAssignment


def get_active_assignment(db, gateway_uid):
    gateway = db.query(Gateway).filter_by(gateway_uid=gateway_uid).first()

    if not gateway:
        return None

    # DB columns are 'timestamp without time zone'; compare against naive UTC
    now = datetime.utcnow()

    assignment = (
        db.query(GatewayAssignment)
        .filter(
            GatewayAssignment.gateway_id == gateway.id,
            GatewayAssignment.is_active == True,
            or_(GatewayAssignment.end_date == None, GatewayAssignment.end_date > now),
        )
        .first()
    )

    return assignment
