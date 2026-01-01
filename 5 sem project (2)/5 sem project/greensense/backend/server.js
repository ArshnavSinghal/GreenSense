const express = require('express');
const cors = require('cors'); // Required to allow frontend to fetch data
const dotenv = require('dotenv');
const aqiService = require('./services/aqiService');
const environmentalService = require('./services/environmentalService');
const ndviService = require('./services/ndviService');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware Setup ---
// CORS is critical: Allows your React frontend (on a different port) to access this backend.
app.use(cors()); 
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// 1. Root Status Endpoint
app.get('/api/status', (req, res) => {
    res.json({
        backendStatus: 'ok',
        serverTime: new Date().toISOString(),
        message: 'GreenSense Backend is operational with real OpenWeatherMap AQI data.',
        apiIntegration: {
            openWeatherMap: !!process.env.OPENWEATHER_API_KEY,
            aqiService: 'Active'
        }
    });
});

// 2. Air Quality Index (AQI) Endpoint - Now using real OpenWeatherMap data
app.get('/api/aqi/:city', async (req, res) => {
    const city = req.params.city || 'Default Location';
    console.log(`Fetching real AQI data for: ${city}`);
    
    try {
        const aqiData = await aqiService.getAQIData(city);
        res.json(aqiData);
    } catch (error) {
        console.error(`Error fetching AQI for ${city}:`, error.message);
        res.status(500).json({
            error: 'Failed to fetch AQI data',
            message: error.message,
            city: city
        });
    }
});

// 3. Carbon Emissions Endpoint - Now using real environmental data
app.get('/api/carbon/:city', async (req, res) => {
    const city = req.params.city || 'Global Average';
    console.log(`Fetching real Carbon Emissions for: ${city}`);
    
    try {
        const carbonData = await environmentalService.getCarbonEmissions(city);
        res.json(carbonData);
    } catch (error) {
        console.error(`Error fetching carbon emissions for ${city}:`, error.message);
        res.status(500).json({
            error: 'Failed to fetch carbon emissions data',
            message: error.message,
            city: city
        });
    }
});

// 4. Water Usage Endpoint - Now using real environmental data
app.get('/api/water/:city', async (req, res) => {
    const city = req.params.city || 'Region X';
    console.log(`Fetching real Water Stress data for: ${city}`);
    
    try {
        const waterData = await environmentalService.getWaterStress(city);
        res.json(waterData);
    } catch (error) {
        console.error(`Error fetching water stress for ${city}:`, error.message);
        res.status(500).json({
            error: 'Failed to fetch water stress data',
            message: error.message,
            city: city
        });
    }
});

// 5. NDVI Endpoint - Now using real satellite data simulation
app.get('/api/ndvi/:areaId', async (req, res) => {
    const areaId = req.params.areaId || 'default-area';
    const city = req.query.city; // Optional city parameter
    console.log(`Fetching NDVI data for area: ${areaId}, city: ${city || 'N/A'}`);
    
    try {
        const ndviData = await ndviService.getNDVIData(areaId, city);
        res.json(ndviData);
    } catch (error) {
        console.error(`Error fetching NDVI for area ${areaId}:`, error.message);
        res.status(500).json({
            error: 'Failed to fetch NDVI data',
            message: error.message,
            areaId: areaId
        });
    }
});

// 6. Pollution Forecast Endpoint - 7-day forecast
app.get('/api/forecast/pollution/:city', async (req, res) => {
    const city = req.params.city || 'Default City';
    console.log(`Fetching pollution forecast for: ${city}`);
    
    try {
        const forecastData = await environmentalService.getPollutionForecast(city);
        res.json(forecastData);
    } catch (error) {
        console.error(`Error fetching pollution forecast for ${city}:`, error.message);
        res.status(500).json({
            error: 'Failed to fetch pollution forecast',
            message: error.message,
            city: city
        });
    }
});

// 7. Environmental Recommendations Endpoint
app.get('/api/recommendations', async (req, res) => {
    const city = req.query.city || 'Mumbai';
    const riskLevel = parseFloat(req.query.risk) || 0.8;
    console.log(`Generating recommendations for: ${city}, risk level: ${riskLevel}`);
    
    try {
        const recommendations = await environmentalService.getRecommendations(city, riskLevel);
        res.json(recommendations);
    } catch (error) {
        console.error(`Error generating recommendations for ${city}:`, error.message);
        res.status(500).json({
            error: 'Failed to generate recommendations',
            message: error.message,
            city: city
        });
    }
});

// 8. Batch NDVI Endpoint for multiple areas
app.post('/api/ndvi/batch', async (req, res) => {
    const { areaIds } = req.body;
    
    if (!areaIds || !Array.isArray(areaIds)) {
        return res.status(400).json({
            error: 'Invalid request',
            message: 'areaIds array is required'
        });
    }
    
    console.log(`Processing batch NDVI request for ${areaIds.length} areas`);
    
    try {
        const batchData = await ndviService.getBatchNDVIData(areaIds);
        res.json(batchData);
    } catch (error) {
        console.error('Error processing batch NDVI request:', error.message);
        res.status(500).json({
            error: 'Failed to process batch NDVI request',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `${req.method} ${req.originalUrl} is not a valid endpoint`,
        availableEndpoints: [
            'GET /api/status',
            'GET /api/aqi/:city',
            'GET /api/carbon/:city',
            'GET /api/water/:city',
            'GET /api/ndvi/:areaId',
            'GET /api/forecast/pollution/:city',
            'GET /api/recommendations',
            'POST /api/ndvi/batch'
        ]
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🌱 GreenSense Backend running on port ${PORT}`);
    console.log('--- AVAILABLE ENDPOINTS ---');
    console.log(`✅ GET /api/status - Health check`);
    console.log(`🌫️  GET /api/aqi/:city - Air Quality Index`);
    console.log(`⚡ GET /api/carbon/:city - Carbon Emissions`);
    console.log(`💧 GET /api/water/:city - Water Stress Index`);
    console.log(`🌳 GET /api/ndvi/:areaId - NDVI Vegetation Analysis`);
    console.log(`📊 GET /api/forecast/pollution/:city - 7-day Pollution Forecast`);
    console.log(`💡 GET /api/recommendations - Environmental Recommendations`);
    console.log(`📦 POST /api/ndvi/batch - Batch NDVI Processing`);
    console.log('--- API INTEGRATION STATUS ---');
    console.log(`OpenWeatherMap API: ${process.env.OPENWEATHER_API_KEY ? '✅ Connected' : '❌ Missing API Key'}`);
    console.log('Ready to serve real environmental data! 🚀');
});