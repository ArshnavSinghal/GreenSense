from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import random
import math
from datetime import datetime, timedelta

router = APIRouter()

def calculate_ndvi_simulation(lat: float, lon: float, area_id: str):
    """Simulate NDVI calculation based on geographic coordinates"""
    # Base NDVI calculation considering latitude (climate zones)
    base_ndvi = 0.5
    
    # Tropical regions (higher vegetation)
    if abs(lat) < 23.5:
        base_ndvi = 0.7 + random.uniform(0, 0.2)  # 0.7-0.9
    # Temperate regions
    elif abs(lat) < 50:
        base_ndvi = 0.5 + random.uniform(0, 0.3)  # 0.5-0.8
    # Polar regions (lower vegetation)
    else:
        base_ndvi = 0.2 + random.uniform(0, 0.3)  # 0.2-0.5
    
    # Seasonal variation
    month = datetime.now().month
    if lat > 0:  # Northern hemisphere
        if 3 <= month <= 8:  # Spring/Summer
            seasonal_factor = 1.1
        else:  # Fall/Winter
            seasonal_factor = 0.8
    else:  # Southern hemisphere
        if month >= 9 or month <= 2:  # Spring/Summer
            seasonal_factor = 1.1
        else:  # Fall/Winter
            seasonal_factor = 0.8
    
    # Urban factor (simplified)
    urban_factor = random.uniform(0.6, 1.0)  # Cities have lower NDVI
    
    final_ndvi = base_ndvi * seasonal_factor * urban_factor
    return max(0, min(1, final_ndvi))

def get_vegetation_health(ndvi: float):
    """Determine vegetation health from NDVI value"""
    if ndvi >= 0.8:
        return "Excellent"
    elif ndvi >= 0.6:
        return "Good"
    elif ndvi >= 0.4:
        return "Moderate"
    elif ndvi >= 0.2:
        return "Poor"
    else:
        return "Very Poor"

def generate_historical_ndvi(current_ndvi: float, months: int = 12):
    """Generate historical NDVI data"""
    historical = []
    
    for i in range(months, 0, -1):
        date = datetime.now() - timedelta(days=i * 30)
        
        # Add seasonal and random variation
        seasonal_variation = math.sin((date.month - 1) * math.pi / 6) * 0.1
        random_variation = random.uniform(-0.05, 0.05)
        
        historical_ndvi = current_ndvi + seasonal_variation + random_variation
        historical_ndvi = max(0, min(1, historical_ndvi))
        
        historical.append({
            "date": date.strftime("%Y-%m-%d"),
            "ndvi": round(historical_ndvi, 3),
            "month": date.strftime("%b")
        })
    
    return historical

@router.get("/")
def get_ndvi_demo():
    """Demo NDVI endpoint with sample data"""
    return {
        "message": "NDVI Analysis Service",
        "description": "Normalized Difference Vegetation Index calculation and analysis",
        "available_endpoints": [
            "GET /calculate - Calculate NDVI for coordinates",
            "GET /area/{area_id} - Get NDVI for specific area",
            "GET /historical - Get historical NDVI trends",
            "POST /batch - Batch NDVI calculation"
        ],
        "status": "operational"
    }

@router.get("/calculate")
def calculate_ndvi(
    lat: float = Query(..., description="Latitude", ge=-90, le=90),
    lon: float = Query(..., description="Longitude", ge=-180, le=180),
    area_id: Optional[str] = Query("default", description="Area identifier")
):
    """Calculate NDVI for given coordinates"""
    try:
        ndvi_value = calculate_ndvi_simulation(lat, lon, area_id)
        vegetation_health = get_vegetation_health(ndvi_value)
        
        # Generate analysis
        analysis = {
            "forest_cover": round(random.uniform(10, 80), 1) if ndvi_value > 0.3 else round(random.uniform(0, 20), 1),
            "crop_health": "Healthy" if ndvi_value > 0.6 else "Moderate" if ndvi_value > 0.4 else "Poor",
            "urban_green_space": f"{round(ndvi_value * 100)}%",
            "biodiversity_index": round(ndvi_value * 10, 1)
        }
        
        return {
            "coordinates": {"lat": lat, "lon": lon},
            "area_id": area_id,
            "ndvi": round(ndvi_value, 3),
            "vegetation_health": vegetation_health,
            "analysis": analysis,
            "calculation_date": datetime.now().isoformat(),
            "data_source": "Simulated satellite imagery",
            "resolution": "250m",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NDVI calculation failed: {str(e)}")

@router.get("/area/{area_id}")
def get_area_ndvi(
    area_id: str,
    include_historical: Optional[bool] = Query(False, description="Include historical data")
):
    """Get NDVI data for a specific area"""
    try:
        # Simulate area coordinates (in real implementation, lookup from database)
        area_coords = {
            "Amazon-Basin-01": {"lat": -3.4653, "lon": -62.2159},
            "Sahara-Desert-01": {"lat": 23.8859, "lon": 45.0792},
            "Congo-Forest-01": {"lat": -0.2280, "lon": 15.8277},
            "default": {"lat": 28.6139, "lon": 77.2090}  # Delhi
        }
        
        coords = area_coords.get(area_id, area_coords["default"])
        ndvi_value = calculate_ndvi_simulation(coords["lat"], coords["lon"], area_id)
        vegetation_health = get_vegetation_health(ndvi_value)
        
        result = {
            "area_id": area_id,
            "coordinates": coords,
            "ndvi": round(ndvi_value, 3),
            "vegetation_health": vegetation_health,
            "trend": random.choice(["improving", "stable", "declining"]),
            "last_updated": datetime.now().isoformat(),
            "data_quality": "Good",
            "cloud_cover": round(random.uniform(0, 30), 1),
            "status": "success"
        }
        
        if include_historical:
            result["historical_data"] = generate_historical_ndvi(ndvi_value)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Area NDVI retrieval failed: {str(e)}")

@router.get("/historical")
def get_historical_ndvi(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    months: Optional[int] = Query(12, description="Number of months", ge=1, le=60)
):
    """Get historical NDVI trends"""
    try:
        current_ndvi = calculate_ndvi_simulation(lat, lon, "historical")
        historical_data = generate_historical_ndvi(current_ndvi, months)
        
        # Calculate trend
        recent_avg = sum([d["ndvi"] for d in historical_data[-3:]]) / 3
        older_avg = sum([d["ndvi"] for d in historical_data[:3]]) / 3
        
        if recent_avg > older_avg + 0.05:
            trend = "improving"
        elif recent_avg < older_avg - 0.05:
            trend = "declining"
        else:
            trend = "stable"
        
        return {
            "coordinates": {"lat": lat, "lon": lon},
            "current_ndvi": round(current_ndvi, 3),
            "historical_data": historical_data,
            "trend_analysis": {
                "overall_trend": trend,
                "recent_average": round(recent_avg, 3),
                "historical_average": round(older_avg, 3),
                "change_rate": round((recent_avg - older_avg) * 100, 1)
            },
            "analysis_period": f"{months} months",
            "generated_at": datetime.now().isoformat(),
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Historical NDVI analysis failed: {str(e)}")

@router.post("/batch")
def batch_ndvi_calculation(request: dict):
    """Calculate NDVI for multiple locations"""
    try:
        locations = request.get("locations", [])
        if not locations:
            raise HTTPException(status_code=400, detail="No locations provided")
        
        results = []
        for location in locations:
            lat = location.get("lat")
            lon = location.get("lon")
            area_id = location.get("area_id", f"batch_{len(results)}")
            
            if lat is None or lon is None:
                results.append({
                    "area_id": area_id,
                    "error": "Missing coordinates",
                    "status": "failed"
                })
                continue
            
            try:
                ndvi_value = calculate_ndvi_simulation(lat, lon, area_id)
                results.append({
                    "area_id": area_id,
                    "coordinates": {"lat": lat, "lon": lon},
                    "ndvi": round(ndvi_value, 3),
                    "vegetation_health": get_vegetation_health(ndvi_value),
                    "status": "success"
                })
            except Exception as e:
                results.append({
                    "area_id": area_id,
                    "error": str(e),
                    "status": "failed"
                })
        
        return {
            "total_locations": len(locations),
            "successful_calculations": len([r for r in results if r["status"] == "success"]),
            "failed_calculations": len([r for r in results if r["status"] == "failed"]),
            "results": results,
            "processed_at": datetime.now().isoformat(),
            "status": "completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch NDVI calculation failed: {str(e)}")

@router.get("/alerts")
def get_vegetation_alerts(
    threshold: Optional[float] = Query(0.3, description="NDVI threshold for alerts", ge=0, le=1)
):
    """Get vegetation health alerts"""
    try:
        # Simulate alerts for demonstration
        alerts = []
        
        # Generate some sample alerts
        alert_areas = [
            {"area_id": "Forest-A1", "lat": 12.9716, "lon": 77.5946, "ndvi": 0.25},
            {"area_id": "Urban-B2", "lat": 19.0760, "lon": 72.8777, "ndvi": 0.15},
            {"area_id": "Agricultural-C3", "lat": 28.6139, "lon": 77.2090, "ndvi": 0.28}
        ]
        
        for area in alert_areas:
            if area["ndvi"] < threshold:
                alerts.append({
                    "area_id": area["area_id"],
                    "coordinates": {"lat": area["lat"], "lon": area["lon"]},
                    "current_ndvi": area["ndvi"],
                    "threshold": threshold,
                    "severity": "High" if area["ndvi"] < 0.2 else "Medium",
                    "alert_type": "Low vegetation health",
                    "recommendations": [
                        "Investigate potential causes",
                        "Consider reforestation efforts",
                        "Monitor soil conditions"
                    ],
                    "detected_at": datetime.now().isoformat()
                })
        
        return {
            "threshold": threshold,
            "total_alerts": len(alerts),
            "alerts": alerts,
            "generated_at": datetime.now().isoformat(),
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vegetation alerts retrieval failed: {str(e)}")
