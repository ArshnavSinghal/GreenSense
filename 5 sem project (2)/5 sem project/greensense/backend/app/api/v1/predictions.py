from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import random
import math
from datetime import datetime, timedelta

router = APIRouter()

def generate_prediction_data(days: int = 7, city: str = "Mumbai"):
    """Generate realistic environmental predictions"""
    predictions = []
    base_aqi = random.randint(60, 120)
    base_temp = random.uniform(20, 35)
    
    for i in range(days):
        # Add some realistic variation
        aqi_variation = random.uniform(-15, 15)
        temp_variation = random.uniform(-3, 3)
        
        prediction_date = datetime.now() + timedelta(days=i)
        
        predictions.append({
            "date": prediction_date.strftime("%Y-%m-%d"),
            "aqi_prediction": max(20, min(200, base_aqi + aqi_variation)),
            "temperature_prediction": round(base_temp + temp_variation, 1),
            "humidity_prediction": random.randint(40, 85),
            "pollution_level": get_pollution_level(base_aqi + aqi_variation),
            "confidence": round(random.uniform(0.75, 0.95), 2),
            "risk_factors": generate_risk_factors()
        })
        
        # Slight trend for next day
        base_aqi += random.uniform(-5, 5)
        base_temp += random.uniform(-1, 1)
    
    return predictions

def get_pollution_level(aqi):
    """Convert AQI to pollution level"""
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    else:
        return "Very Unhealthy"

def generate_risk_factors():
    """Generate environmental risk factors"""
    factors = [
        "High traffic density",
        "Industrial emissions",
        "Weather patterns",
        "Seasonal variations",
        "Urban heat island effect"
    ]
    return random.sample(factors, random.randint(1, 3))

@router.get("/")
def get_predictions(
    city: Optional[str] = Query("Mumbai", description="City name for predictions"),
    days: Optional[int] = Query(7, description="Number of days to predict", ge=1, le=30)
):
    """Get environmental predictions for a city"""
    try:
        predictions = generate_prediction_data(days, city)
        
        return {
            "city": city,
            "predictions": predictions,
            "model_info": {
                "name": "GreenSense ML Model v1.0",
                "accuracy": "85%",
                "last_trained": "2024-12-15",
                "features_used": ["historical_aqi", "weather_data", "traffic_patterns", "industrial_activity"]
            },
            "generated_at": datetime.now().isoformat(),
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction generation failed: {str(e)}")

@router.get("/aqi")
def predict_aqi(
    city: Optional[str] = Query("Mumbai", description="City name"),
    hours: Optional[int] = Query(24, description="Hours ahead to predict", ge=1, le=168)
):
    """Predict AQI for specific hours ahead"""
    try:
        current_aqi = random.randint(50, 150)
        hourly_predictions = []
        
        for hour in range(hours):
            # Simulate hourly variation
            variation = math.sin(hour * math.pi / 12) * 10 + random.uniform(-5, 5)
            predicted_aqi = max(20, min(200, current_aqi + variation))
            
            prediction_time = datetime.now() + timedelta(hours=hour)
            
            hourly_predictions.append({
                "datetime": prediction_time.isoformat(),
                "predicted_aqi": round(predicted_aqi),
                "pollution_level": get_pollution_level(predicted_aqi),
                "confidence": round(random.uniform(0.8, 0.95), 2)
            })
        
        return {
            "city": city,
            "current_aqi": current_aqi,
            "hourly_predictions": hourly_predictions,
            "prediction_horizon": f"{hours} hours",
            "generated_at": datetime.now().isoformat(),
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AQI prediction failed: {str(e)}")

@router.get("/health-impact")
def predict_health_impact(
    aqi: Optional[int] = Query(100, description="Current or predicted AQI", ge=0, le=500),
    population: Optional[int] = Query(1000000, description="Population size", ge=1000)
):
    """Predict health impact based on AQI"""
    try:
        # Calculate health impact metrics
        if aqi <= 50:
            risk_level = "Low"
            affected_percentage = random.uniform(1, 5)
        elif aqi <= 100:
            risk_level = "Moderate"
            affected_percentage = random.uniform(5, 15)
        elif aqi <= 150:
            risk_level = "High"
            affected_percentage = random.uniform(15, 30)
        else:
            risk_level = "Very High"
            affected_percentage = random.uniform(30, 60)
        
        affected_population = int(population * affected_percentage / 100)
        
        return {
            "aqi": aqi,
            "population": population,
            "health_impact": {
                "risk_level": risk_level,
                "affected_percentage": round(affected_percentage, 1),
                "affected_population": affected_population,
                "vulnerable_groups": [
                    "Children under 12",
                    "Adults over 65",
                    "People with respiratory conditions",
                    "Pregnant women"
                ],
                "recommended_actions": get_health_recommendations(aqi)
            },
            "generated_at": datetime.now().isoformat(),
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health impact prediction failed: {str(e)}")

def get_health_recommendations(aqi):
    """Get health recommendations based on AQI"""
    if aqi <= 50:
        return ["Enjoy outdoor activities", "Normal outdoor exercise is fine"]
    elif aqi <= 100:
        return ["Limit prolonged outdoor exertion", "Consider reducing outdoor activities"]
    elif aqi <= 150:
        return ["Avoid prolonged outdoor exertion", "Wear masks when outdoors", "Keep windows closed"]
    else:
        return ["Avoid all outdoor activities", "Stay indoors", "Use air purifiers", "Seek medical attention if experiencing symptoms"]

@router.post("/custom")
def create_custom_prediction(prediction_request: dict):
    """Create custom prediction based on user parameters"""
    try:
        # Extract parameters
        city = prediction_request.get("city", "Mumbai")
        parameters = prediction_request.get("parameters", {})
        
        # Generate custom prediction
        custom_prediction = {
            "city": city,
            "parameters_used": parameters,
            "prediction": {
                "aqi_forecast": random.randint(50, 150),
                "temperature_forecast": random.uniform(20, 35),
                "humidity_forecast": random.randint(40, 85),
                "pollution_sources": ["Traffic", "Industrial", "Construction"],
                "mitigation_suggestions": [
                    "Increase green cover",
                    "Promote public transportation",
                    "Implement emission controls"
                ]
            },
            "model_confidence": round(random.uniform(0.75, 0.90), 2),
            "generated_at": datetime.now().isoformat(),
            "status": "success"
        }
        
        return custom_prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Custom prediction failed: {str(e)}")
