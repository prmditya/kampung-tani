"""
Repository Layer
Handles all database operations following the Repository pattern
"""

from app.api.v1.repositories.user_repository import UserRepository
from app.api.v1.repositories.gateway_repository import GatewayRepository
from app.api.v1.repositories.sensor_repository import SensorRepository
from app.api.v1.repositories.sensor_data_repository import SensorDataRepository
from app.api.v1.repositories.farmer_repository import FarmerRepository
from app.api.v1.repositories.farm_repository import FarmRepository
from app.api.v1.repositories.gateway_assignment_repository import GatewayAssignmentRepository
from app.api.v1.repositories.gateway_status_history_repository import GatewayStatusHistoryRepository

__all__ = [
    "UserRepository",
    "GatewayRepository",
    "SensorRepository",
    "SensorDataRepository",
    "FarmerRepository",
    "FarmRepository",
    "GatewayAssignmentRepository",
    "GatewayStatusHistoryRepository",
]
