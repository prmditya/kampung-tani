"""
Repository Layer
Handles all database operations following the Repository pattern
"""

from app.api.repositories.user_repository import UserRepository
from app.api.repositories.gateway_repository import GatewayRepository
from app.api.repositories.sensor_repository import SensorRepository
from app.api.repositories.sensor_data_repository import SensorDataRepository
from app.api.repositories.farmer_repository import FarmerRepository
from app.api.repositories.farm_repository import FarmRepository
from app.api.repositories.gateway_assignment_repository import GatewayAssignmentRepository
from app.api.repositories.gateway_status_history_repository import GatewayStatusHistoryRepository

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
