from fastapi import APIRouter, HTTPException
from typing import List, Optional
import requests
import os
from datetime import datetime
import random

router = APIRouter()

# Mock sensor data generator for demonstration
def generate_mock_sensor_data():
    """Generate realistic sensor data for demonstration"""
    return {
        "id": random.randint(1000, 9999),
        "temperature": round(random.uniform(15.0, 35.0), 1),
        "humidity": round(random.uniform(30.0, 90.0), 1),
        "air_quality": random.randint(20, 200),
        "pm2_5": round(random.uniform(5.0, 150.0), 1),
        "pm10": round(random.uniform(10.0, 200.0), 1),
        "co2": random.randint(300, 1200),
        "timestamp": datetime.now().isoformat(),
        "location": "Sensor Station Alpha",
        "status": "active"
    }

@router.get("/")
def get_all_sensors():
    """Get all sensor readings"""
    # Generate multiple sensor readings for demonstration
    sensors = []
    for i in range(5):
        sensor_data = generate_mock_sensor_data()
        sensor_data["id"] = 1000 + i
        sensor_data["location"] = f"Sensor Station {chr(65 + i)}"  # A, B, C, D, E
        sensors.append(sensor_data)
    
    return {
        "sensors": sensors,
        "total_count": len(sensors),
        "timestamp": datetime.now().isoformat(),
        "status": "success"
    }

@router.get("/latest")
def get_latest_sensor_data():
    """Get the latest sensor reading"""
    latest_data = generate_mock_sensor_data()
    return {
        "data": latest_data,
        "timestamp": datetime.now().isoformat(),
        "status": "success"
    }

@router.get("/{sensor_id}")
def get_sensor_by_id(sensor_id: int):
    """Get sensor data by ID"""
    if sensor_id < 1000 or sensor_id > 9999:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    sensor_data = generate_mock_sensor_data()
    sensor_data["id"] = sensor_id
    
    return {
        "data": sensor_data,
        "timestamp": datetime.now().isoformat(),
        "status": "success"
    }

@router.post("/")
def add_sensor_data(data: dict):
    """Add new sensor data"""
    # Validate required fields
    required_fields = ["temperature", "humidity", "air_quality"]
    for field in required_fields:
        if field not in data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Simulate storing data (in real implementation, save to database)
    new_data = {
        "id": random.randint(1000, 9999),
        "temperature": data.get("temperature"),
        "humidity": data.get("humidity"),
        "air_quality": data.get("air_quality"),
        "pm2_5": data.get("pm2_5", 0),
        "pm10": data.get("pm10", 0),
        "co2": data.get("co2", 400),
        "timestamp": datetime.now().isoformat(),
        "location": data.get("location", "Unknown"),
        "status": "stored"
    }
    
    return {
        "message": "Sensor data stored successfully",
        "data": new_data,
        "timestamp": datetime.now().isoformat(),
        "status": "success"
    }

@router.get("/stats/summary")
def get_sensor_stats():
    """Get sensor statistics summary"""
    # Generate realistic statistics
    return {
        "total_sensors": 5,
        "active_sensors": 4,
        "offline_sensors": 1,
        "average_temperature": round(random.uniform(20.0, 30.0), 1),
        "average_humidity": round(random.uniform(50.0, 70.0), 1),
        "average_aqi": random.randint(50, 120),
        "last_updated": datetime.now().isoformat(),
        "data_quality": "Good",
        "status": "operational"
    }
