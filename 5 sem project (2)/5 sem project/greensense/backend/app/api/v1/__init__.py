"""API v1 package"""
from .sensors import router as sensors_router
from .auth import router as auth_router
from .predictions import router as predictions_router
from .ndvi import router as ndvi_router

__all__ = ["sensors_router", "auth_router", "predictions_router", "ndvi_router"]
