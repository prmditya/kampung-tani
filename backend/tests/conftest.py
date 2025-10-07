import pytest
import os
import sys
from unittest.mock import patch

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.core.config import get_settings


@pytest.fixture
def app():
    """Create application for testing"""
    # Use development settings for testing
    settings = get_settings()
    settings.DEBUG = True
    app = create_app()
    return app


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Create test CLI runner"""
    return app.test_cli_runner()


@pytest.fixture
def mock_db():
    """Mock database service"""
    with patch("app.services.database.db_service") as mock:
        yield mock
