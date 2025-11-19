const express = require('express');
const cors = require('cors'); // Required to allow frontend to fetch data
const dotenv = require('dotenv');
// Note: You would typically use 'axios' here to fetch data from external APIs (like OpenAQ, WRI, NASA Earthdata)

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware Setup ---
// CORS is critical: Allows your React frontend (on a different port) to access this backend.
app.use(cors()); 
app.use(express.json());

// --- Utility/Mock Data Functions ---
// These functions are designed to be robust and always return structured data.
const mockData = {
    // Simulates an OpenAQ/Air Quality data response
    getAqiData: (city) => ({
        city: city || 'Default Location',
        aqi: Math.floor(Math.random() * 200) + 10,
        mainPollutant: 'PM2.5',
        level: city === 'Mumbai' ? 'Unhealthy' : 'Moderate',
        date: new Date().toISOString(),
    }),

    // Simulates Carbon Emissions data
    getCarbonEmissions: (city) => ({
        city: city || 'Global Average',
        // Values in CO2 metric tons
        totalAnnualEmissions: (Math.random() * 50000000).toFixed(2),
        industryBreakdown: [
            { sector: 'Energy', percentage: 45 + Math.floor(Math.random() * 10) },
            { sector: 'Transportation', percentage: 25 + Math.floor(Math.random() * 5) },
            { sector: 'Industry', percentage: 15 + Math.floor(Math.random() * 5) },
            { sector: 'Residential/Commercial', percentage: 15 - Math.floor(Math.random() * 5) },
        ],
    }),

    // Simulates Water Usage and Stress Index
    getWaterUsage: (city) => ({
        city: city || 'Region X',
        totalConsumptionLiters: (Math.random() * 1000000000).toFixed(0),
        stressIndex: (Math.random() * 4 + 1).toFixed(1), // 1 (Low) to 5 (Extremely High)
        forecast: 'Drought risk increasing by 10% in the next quarter.',
    }),

    // Simulates NDVI (Normalized Difference Vegetation Index) data
    getNdviData: (areaId) => {
        const ndvi = (Math.random() * 0.5 + 0.3).toFixed(3); // Typical range 0.3 to 0.8
        let status = 'Healthy Vegetation';
        if (ndvi < 0.4) status = 'Sparse/Stressed Vegetation';
        return {
            areaId: areaId || 'Forest-1A',
            ndvi,
            status,
            lastUpdated: new Date().toISOString(),
            imageUrl: `https://placehold.co/600x400/228B22/FFFFFF?text=NDVI+Map+Area+${areaId}`,
            vegetationChange: (Math.random() * 2 - 1).toFixed(2) + '%', // % change vs last year
        };
    },
    
    // Simple mock function for personalized recommendations
    getRecommendations: (riskScore) => {
        if (riskScore > 0.7) {
            return [
                { id: 1, title: "Reduce Meat Consumption", impact: "High", detail: "Switching to plant-based meals 3 times a week can save up to 1 ton of CO2 annually." },
                { id: 2, title: "Public Transport Challenge", impact: "Medium", detail: "Use public transportation or cycle for 50% of your commute this month." },
                { id: 3, title: "Check for Water Leaks", impact: "Immediate", detail: "A single leaky faucet can waste hundreds of liters a month. Fix it now!" }
            ];
        }
        return [
            { id: 4, title: "Optimize Home Energy", impact: "Low", detail: "Switch all bulbs to LED and unplug idle devices (vampire power)." }
        ];
    },

    // Mock function for predictive modeling
    getPollutionForecast: (city) => ({
        city: city || 'Default Location',
        model: 'ARIMA/LSTM (Mock)',
        forecastDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        aqiPrediction: Math.floor(Math.random() * 150) + 50,
        risk: 'Medium',
        notes: 'AQI is expected to peak on Friday due to anticipated low wind speed and temperature inversion.',
    }),
};
// --- End Utility/Mock Data Functions ---


// 1. Root Status Endpoint
app.get('/api/status', (req, res) => {
    res.json({
        backendStatus: 'ok',
        serverTime: new Date().toISOString(),
        message: 'GreenSense Backend is operational and ready for environmental data.',
    });
});

// 2. Air Quality Index (AQI) Endpoint
app.get('/api/aqi/:city', (req, res) => {
    const city = req.params.city || 'Default Location';
    console.log(`Fetching AQI for: ${city}`);
    res.json(mockData.getAqiData(city));
});

// 3. Carbon Emissions Endpoint
app.get('/api/carbon/:city', (req, res) => {
    const city = req.params.city || 'Global Average';
    console.log(`Fetching Carbon Emissions for: ${city}`);
    res.json(mockData.getCarbonEmissions(city));
});

// 4. Water Usage Endpoint
app.get('/api/water/:city', (req, res) => {
    const city = req.params.city || 'Region X';
    console.log(`Fetching Water Usage for: ${city}`);
    res.json(mockData.getWaterUsage(city));
});

// 5. Remote Sensing (NDVI) Endpoint
app.get('/api/ndvi/:areaId', (req, res) => {
    const areaId = req.params.areaId || 'Forest-1A';
    console.log(`Fetching NDVI data for area: ${areaId}`);
    res.json(mockData.getNdviData(areaId));
});

// 6. Pollution Forecast Endpoint
app.get('/api/forecast/pollution/:city', (req, res) => {
    const city = req.params.city || 'Mumbai';
    console.log(`Generating pollution forecast for: ${city}`);
    res.json(mockData.getPollutionForecast(city));
});

// 7. Personalized Recommendations Endpoint
app.get('/api/recommendations', (req, res) => {
    // Simple logic based on a query parameter or mock
    const userRiskScore = parseFloat(req.query.risk || 0.8);
    console.log(`Generating recommendations for risk score: ${userRiskScore}`);
    res.json({
        recommendations: mockData.getRecommendations(userRiskScore)
    });
});


// Error handling for 404
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found. Please check API documentation.'
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`GreenSense Backend running on port ${PORT}`);
    console.log('--- AVAILABLE ENDPOINTS ---');
    console.log(`GET /api/status`);
    console.log(`GET /api/aqi/:city`);
    // ... other endpoints for visualization
});