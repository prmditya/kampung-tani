#!/usr/bin/env python3
"""
Kampung Tani IoT API - FastAPI with Async SQLAlchemy
Modern, fast, and clean RESTful API with automatic OpenAPI documentation
"""

import textwrap
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

# Import v1 routers
from app.api.v1.routers import (
    auth,
    gateways,
    sensors,
    health,
    farmers,
    farms,
    gateway_assignments,
    gateway_status_history,
    dashboard,
)
from app.core.config import get_settings
from app.core.database import check_database_health, close_db

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifecycle
    Handles startup and shutdown events
    """
    # Startup
    logger.info("🚀 Starting Kampung Tani IoT API v1")
    settings = get_settings()

    # Test database connection
    try:
        db_healthy = await check_database_health()
        if db_healthy:
            logger.info("✅ Database connection successful")
        else:
            logger.warning("⚠️  Database connection failed")
            logger.info("🔄 API will start without database health check")
    except Exception as e:
        logger.error(f"❌ Database connection error: {e}")
        logger.info("🔄 API will start without database")

    yield

    # Shutdown
    logger.info("🛑 Shutting down Kampung Tani IoT API")
    await close_db()
    logger.info("✅ Database connections closed")


# Get settings
settings = get_settings()

description = """
    🌱 **Modern FastAPI-based IoT Monitoring System**

    ## Features
    * **Fast & Modern**: Built with FastAPI + async SQLAlchemy for maximum performance
    * **Auto Documentation**: Interactive OpenAPI docs with Swagger UI
    * **Type Safety**: Full Python type hints and Pydantic models
    * **JWT Authentication**: Secure user authentication system
    * **Real-time Data**: Live sensor data monitoring from gateways
    * **Gateway Management**: Complete gateway and sensor lifecycle management
    * **Clean Architecture**: Modular, maintainable codebase following SOLID principles

    ## Architecture
    * **Repository Pattern**: Clean separation of data access logic
    * **Async/Await**: Non-blocking I/O for better performance
    * **SQLAlchemy ORM**: Type-safe database operations
    * **Pydantic Validation**: Request/response validation

    ## Authentication
    Use the `/auth/login` endpoint to get a JWT token, then include it in the Authorization header:
    ```
    Authorization: Bearer <your-jwt-token>
    ```
    """

# Create FastAPI application
app = FastAPI(
    title="Kampung Tani IoT API",
    description=textwrap.dedent(description),
    version=settings.VERSION,
    contact={
        "name": "Kampung Tani Development Team",
        "email": "dev@kampungtani.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    lifespan=lifespan,
    docs_url=settings.DOCS_URL,
    redoc_url=settings.REDOC_URL,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # Use configured origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 routers
app.include_router(health.router, prefix=settings.API_PREFIX, tags=["Health"])
app.include_router(
    auth.router, prefix=f"{settings.API_PREFIX}/auth", tags=["Authentication"]
)
app.include_router(
    dashboard.router, prefix=f"{settings.API_PREFIX}/dashboard", tags=["Dashboard"]
)
app.include_router(
    gateways.router, prefix=f"{settings.API_PREFIX}/gateways", tags=["Gateways"]
)
app.include_router(
    sensors.router, prefix=f"{settings.API_PREFIX}/sensors", tags=["Sensors"]
)
app.include_router(
    farmers.router, prefix=f"{settings.API_PREFIX}/farmers", tags=["Farmers"]
)
app.include_router(
    farms.router, prefix=f"{settings.API_PREFIX}/farms", tags=["Farms"]
)
app.include_router(
    gateway_assignments.router, prefix=f"{settings.API_PREFIX}/gateway-assignments", tags=["Gateway Assignments"]
)
app.include_router(
    gateway_status_history.router, prefix=f"{settings.API_PREFIX}/gateway-status-history", tags=["Gateway Status History"]
)


@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint with API information"""
    return {
        "message": "🌱 Kampung Tani IoT API",
        "version": settings.VERSION,
        "docs": settings.DOCS_URL,
        "redoc": settings.REDOC_URL,
        "status": "healthy",
        "api_prefix": settings.API_PREFIX,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app", host="0.0.0.0", port=5000, reload=settings.DEBUG, log_level="info"
    )
