# GreenSense API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, no authentication is required for API endpoints.

## Rate Limiting
- 100 requests per minute per IP address
- OpenWeather API has its own rate limits (1000 calls/day for free tier)

## Response Format
All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

## Endpoints

### 1. Health Check

**GET** `/api/status`

Check if the backend server is running.

**Response:**
```json
{
  "backendStatus": "ok",
  "serverTime": "2026-01-01T12:00:00.000Z",
  "message": "GreenSense Backend is operational with real API data."
}
```

### 2. Air Quality Index

**GET** `/api/aqi/:city`

Get real-time air quality data for a specific city.

**Parameters:**
- `city` (string, required): City name (e.g., "delhi", "mumbai", "bangalore")

**Response:**
```json
{
  "city": "delhi",
  "aqi": 175,
  "mainPollutant": "PM2.5",
  "level": "Unhealthy",
  "date": "2026-01-01T12:00:00.000Z",
  "components": {
    "co": 233.64,
    "no": 0.01,
    "no2": 0.45,
    "o3": 118.88,
    "so2": 2.87,
    "pm2_5": 45.32,
    "pm10": 67.89,
    "nh3": 12.45
  },
  "source": "OpenWeather API"
}
```

**AQI Levels:**
- 0-50: Good
- 51-100: Moderate
- 101-150: Unhealthy for Sensitive Groups
- 151-200: Unhealthy
- 201-300: Very Unhealthy
- 301+: Hazardous

### 3. Carbon Emissions

**GET** `/api/carbon/:city`

Get carbon emissions data for a specific city/region.

**Parameters:**
- `city` (string, required): City name

**Response:**
```json
{
  "city": "delhi",
  "totalAnnualEmissions": 32500000,
  "region": "North India",
  "year": "2023",
  "source": "Regional Carbon Emissions Database",
  "industryBreakdown": [
    {
      "sector": "Energy & Power",
      "percentage": 51
    },
    {
      "sector": "Transportation",
      "percentage": 28
    },
    {
      "sector": "Industry",
      "percentage": 17
    },
    {
      "sector": "Residential/Commercial",
      "percentage": 4
    }
  ],
  "majorSources": [
    "Thermal Power",
    "Transport",
    "Industry",
    "Residential"
  ]
}
```

### 4. Water Stress Index

**GET** `/api/water/:city`

Get water stress information for a specific city/region.

**Parameters:**
- `city` (string, required): City name

**Response:**
```json
{
  "city": "delhi",
  "stressIndex": 4.9,
  "region": "North India",
  "source": "Regional Water Stress Database",
  "lastUpdated": "2026-01-01T12:00:00.000Z"
}
```

**Stress Index Scale:**
- 1.0-2.0: Low stress
- 2.1-3.0: Moderate stress
- 3.1-4.0: High stress
- 4.1-5.0: Critical stress

### 5. NDVI Vegetation Analysis

**GET** `/api/ndvi/:areaId`

Get NDVI (Normalized Difference Vegetation Index) data for a specific area.

**Parameters:**
- `areaId` (string, required): Area identifier (e.g., "amazon-basin-01", "india-north-01")

**Response:**
```json
{
  "areaId": "amazon-basin-01",
  "ndvi": 0.732,
  "status": "Healthy Vegetation",
  "lastUpdated": "2026-01-01T12:00:00.000Z",
  "vegetationChange": "-0.05%",
  "source": "Satellite Imagery Analysis"
}
```

**NDVI Scale:**
- 0.0-0.2: Bare soil, water, snow
- 0.2-0.4: Sparse vegetation
- 0.4-0.6: Moderate vegetation
- 0.6-0.8: Dense vegetation
- 0.8-1.0: Very dense vegetation

### 6. Pollution Forecast

**GET** `/api/forecast/pollution/:city`

Get 7-day air quality forecast for a specific city.

**Parameters:**
- `city` (string, required): City name

**Response:**
```json
{
  "city": "delhi",
  "model": "Weather-based AQI Prediction",
  "forecastDate": "2026-01-08",
  "aqiPrediction": 150,
  "risk": "Moderate",
  "weatherFactors": {
    "windSpeed": 2.4,
    "humidity": 65.2,
    "temperature": 18.5
  },
  "notes": "Weather-based AQI prediction: High humidity levels may worsen air quality.",
  "source": "OpenWeather API + Weather Analysis"
}
```

### 7. Environmental Recommendations

**GET** `/api/recommendations`

Get personalized environmental recommendations based on current conditions.

**Query Parameters:**
- `city` (string, optional): City name (default: "Mumbai")

**Response:**
```json
{
  "city": "delhi",
  "currentAQI": 175,
  "aqiLevel": "Unhealthy",
  "mainPollutant": "PM2.5",
  "recommendations": [
    {
      "id": 1,
      "title": "Limit Outdoor Activities",
      "impact": "High",
      "detail": "Reduce time spent outdoors, especially exercise."
    },
    {
      "id": 2,
      "title": "Use N95 Masks",
      "impact": "Critical",
      "detail": "Wear N95 masks when going outside."
    },
    {
      "id": 3,
      "title": "Run Air Purifiers",
      "impact": "Medium",
      "detail": "Keep air purifiers running indoors."
    }
  ],
  "generatedAt": "2026-01-01T12:00:00.000Z",
  "source": "Real AQI Data + Expert Recommendations"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `CITY_NOT_FOUND` | The specified city was not found |
| `API_KEY_MISSING` | OpenWeather API key is not configured |
| `API_RATE_LIMIT` | API rate limit exceeded |
| `EXTERNAL_API_ERROR` | Error from external API (OpenWeather) |
| `INVALID_PARAMETER` | Invalid parameter provided |
| `SERVER_ERROR` | Internal server error |

## Example Usage

### JavaScript/Fetch
```javascript
// Get AQI for Delhi
const response = await fetch('http://localhost:3000/api/aqi/delhi');
const data = await response.json();
console.log(data);
```

### cURL
```bash
# Get carbon emissions for Mumbai
curl -X GET "http://localhost:3000/api/carbon/mumbai"
```

### Python/Requests
```python
import requests

# Get water stress for Bangalore
response = requests.get('http://localhost:3000/api/water/bangalore')
data = response.json()
print(data)
```

## Supported Cities

The API supports environmental data for the following Indian cities:

**Major Cities:**
- Delhi, Mumbai, Bangalore, Chennai
- Kolkata, Hyderabad, Pune, Ahmedabad
- Jaipur, Lucknow, Kanpur, Nagpur
- Indore, Thane, Bhopal, Visakhapatnam

**States (for regional data):**
- Haryana, Punjab, Rajasthan, Gujarat
- Maharashtra, Karnataka, Tamil Nadu
- West Bengal, Uttar Pradesh, Madhya Pradesh

## Data Sources

1. **OpenWeather API** - Real-time air quality and weather data
2. **Regional Carbon Database** - City-specific CO2 emissions data
3. **Regional Water Database** - Water stress measurements
4. **Satellite Imagery** - NDVI vegetation analysis

## Rate Limits

- **OpenWeather API**: 1000 calls/day (free tier)
- **Backend API**: 100 requests/minute per IP
- **Concurrent requests**: Maximum 10 concurrent requests

## CORS Policy

The API allows cross-origin requests from:
- `http://localhost:5173` (development frontend)
- `http://localhost:3000` (same origin)

For production, update CORS configuration in the backend.