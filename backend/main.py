#!/usr/bin/env python3
"""
Kampung Tani IoT API - FastAPI Edition
Modern, fast, and clean RESTful API with automatic OpenAPI documentation
"""

from fastapi import FastAPI, HTTPException, Depends, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from typing import Optional

# Import routers
from app.routers import auth, devices, sensors, health
from app.core.config import get_settings
from app.core.database import get_database_connection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    # Startup
    logger.info("🚀 Starting Kampung Tani IoT API")
    settings = get_settings()
    
    # Test database connection (skip for now)
    try:
        conn = get_database_connection()
        conn.close()
        logger.info("✅ Database connection successful")
    except Exception as e:
        logger.warning(f"⚠️ Database connection failed: {e}")
        logger.info("🔄 API will start without database health check")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Kampung Tani IoT API")

# Create FastAPI application
app = FastAPI(
    title="Kampung Tani IoT API",
    description="""
    🌱 **Modern FastAPI-based IoT Monitoring System**
    
    ## Features
    * **Fast & Modern**: Built with FastAPI for maximum performance
    * **Auto Documentation**: Interactive OpenAPI docs with Swagger UI
    * **Type Safety**: Full Python type hints and Pydantic models
    * **JWT Authentication**: Secure user authentication system
    * **Real-time Data**: Live sensor data monitoring
    * **Device Management**: Complete device lifecycle management
    * **Clean Architecture**: Modular, maintainable codebase
    
    ## Authentication
    Use the `/auth/login` endpoint to get a JWT token, then include it in the Authorization header:
    ```
    Authorization: Bearer <your-jwt-token>
    ```
    """,
    version="3.0.0",
    contact={
        "name": "Kampung Tani Development Team",
        "email": "dev@kampungtani.com",
    },
    license_info={
        "name": "MIT",
    },
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(devices.router, prefix="/api/devices", tags=["Devices"])
app.include_router(sensors.router, prefix="/api/sensors", tags=["Sensors"])

@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint redirect to docs"""
    return {
        "message": "🌱 Kampung Tani IoT API",
        "version": "3.0.0",
        "docs": "/api/docs",
        "status": "healthy"
    }

if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5000,
        reload=settings.DEBUG,
        log_level="info"
    )