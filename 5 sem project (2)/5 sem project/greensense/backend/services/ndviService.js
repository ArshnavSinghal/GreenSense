const axios = require('axios');
require('dotenv').config();

class NDVIService {
    constructor() {
        // For NDVI data, we'll use NASA's MODIS data or simulate based on location
        // In production, you'd use services like Google Earth Engine, NASA APIs, or Sentinel Hub
        this.nasaApiKey = process.env.NASA_API_KEY; // Optional - add if you get NASA API key
        this.openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
        this.baseUrl = 'http://api.openweathermap.org/data/2.5';
    }

    // Get NDVI data for a specific area
    async getNDVIData(areaId, city = null) {
        try {
            let coordinates = { lat: 28.6139, lon: 77.2090 }; // Default to Delhi
            
            // If city is provided, get its coordinates
            if (city) {
                try {
                    const coordResponse = await axios.get(`${this.baseUrl}/weather`, {
                        params: {
                            q: city,
                            appid: this.openWeatherApiKey
                        }
                    });
                    coordinates = coordResponse.data.coord;
                } catch (error) {
                    console.log(`Could not get coordinates for ${city}, using default location`);
                }
            }

            // Simulate NDVI data based on location and season
            const ndviValue = this.calculateSimulatedNDVI(coordinates.lat, coordinates.lon);
            const vegetationHealth = this.getVegetationHealth(ndviValue);
            const trend = this.calculateTrend(ndviValue);

            // Generate historical data (simulated)
            const historicalData = this.generateHistoricalNDVI(coordinates);

            return {
                areaId: areaId,
                city: city || 'Unknown Location',
                coordinates: coordinates,
                ndvi: ndviValue,
                vegetationHealth: vegetationHealth,
                trend: trend,
                date: new Date().toISOString(),
                historicalData: historicalData,
                analysis: {
                    forestCover: this.estimateForestCover(ndviValue),
                    cropHealth: this.estimateCropHealth(ndviValue),
                    urbanGreenSpace: this.estimateUrbanGreenSpace(ndviValue),
                    seasonalVariation: this.getSeasonalVariation()
                },
                recommendations: this.getVegetationRecommendations(ndviValue),
                source: 'Simulated NDVI data based on geographic location',
                metadata: {
                    resolution: '250m',
                    satellite: 'MODIS Terra/Aqua (simulated)',
                    cloudCover: Math.random() * 20, // 0-20% cloud cover
                    dataQuality: 'Good'
                }
            };
        } catch (error) {
            console.error(`Error fetching NDVI data for area ${areaId}:`, error.message);
            
            // Fallback NDVI data
            return {
                areaId: areaId,
                city: city || 'Unknown Location',
                ndvi: 0.65,
                vegetationHealth: 'Moderate',
                trend: 'stable',
                date: new Date().toISOString(),
                error: 'Using fallback NDVI data',
                source: 'Fallback simulation'
            };
        }
    }

    // Calculate simulated NDVI based on geographic location
    calculateSimulatedNDVI(lat, lon) {
        // Base NDVI calculation considering latitude (climate zones)
        let baseNDVI = 0.5;
        
        // Tropical regions (higher vegetation)
        if (Math.abs(lat) < 23.5) {
            baseNDVI = 0.7 + Math.random() * 0.2; // 0.7-0.9
        }
        // Temperate regions
        else if (Math.abs(lat) < 50) {
            baseNDVI = 0.5 + Math.random() * 0.3; // 0.5-0.8
        }
        // Polar regions (lower vegetation)
        else {
            baseNDVI = 0.2 + Math.random() * 0.3; // 0.2-0.5
        }

        // Seasonal variation (simplified)
        const month = new Date().getMonth();
        const seasonalFactor = this.getSeasonalFactor(month, lat);
        
        // Urban vs rural (longitude-based approximation)
        const urbanFactor = this.getUrbanFactor(lat, lon);
        
        const finalNDVI = baseNDVI * seasonalFactor * urbanFactor;
        return Math.round(Math.max(0, Math.min(1, finalNDVI)) * 1000) / 1000;
    }

    // Get seasonal factor for NDVI
    getSeasonalFactor(month, lat) {
        // Northern hemisphere
        if (lat > 0) {
            // Spring/Summer higher, Fall/Winter lower
            if (month >= 3 && month <= 8) return 1.1; // Mar-Aug
            return 0.8; // Sep-Feb
        }
        // Southern hemisphere (opposite seasons)
        else {
            if (month >= 9 || month <= 2) return 1.1; // Sep-Feb
            return 0.8; // Mar-Aug
        }
    }

    // Get urban factor (cities have lower NDVI)
    getUrbanFactor(lat, lon) {
        // Major cities coordinates (simplified check)
        const majorCities = [
            { lat: 28.6139, lon: 77.2090 }, // Delhi
            { lat: 19.0760, lon: 72.8777 }, // Mumbai
            { lat: 12.9716, lon: 77.5946 }, // Bangalore
            { lat: 13.0827, lon: 80.2707 }, // Chennai
            { lat: 22.5726, lon: 88.3639 }  // Kolkata
        ];

        // Check if coordinates are near major cities
        for (let city of majorCities) {
            const distance = Math.sqrt(
                Math.pow(lat - city.lat, 2) + Math.pow(lon - city.lon, 2)
            );
            if (distance < 1) return 0.6; // Urban area
        }
        
        return 1.0; // Rural area
    }

    // Determine vegetation health from NDVI value
    getVegetationHealth(ndvi) {
        if (ndvi >= 0.8) return 'Excellent';
        if (ndvi >= 0.6) return 'Good';
        if (ndvi >= 0.4) return 'Moderate';
        if (ndvi >= 0.2) return 'Poor';
        return 'Very Poor';
    }

    // Calculate trend (simplified)
    calculateTrend(ndvi) {
        const random = Math.random();
        if (ndvi > 0.7) {
            return random > 0.7 ? 'improving' : 'stable';
        } else if (ndvi < 0.3) {
            return random > 0.3 ? 'declining' : 'stable';
        } else {
            return random > 0.5 ? 'improving' : random > 0.25 ? 'stable' : 'declining';
        }
    }

    // Generate historical NDVI data (simulated)
    generateHistoricalNDVI(coordinates) {
        const historical = [];
        const currentNDVI = this.calculateSimulatedNDVI(coordinates.lat, coordinates.lon);
        
        // Generate 12 months of historical data
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            
            const seasonalFactor = this.getSeasonalFactor(date.getMonth(), coordinates.lat);
            const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
            const historicalNDVI = Math.max(0, Math.min(1, currentNDVI * seasonalFactor + variation));
            
            historical.push({
                date: date.toISOString().split('T')[0],
                ndvi: Math.round(historicalNDVI * 1000) / 1000,
                month: date.toLocaleString('default', { month: 'short' })
            });
        }
        
        return historical;
    }

    // Estimate forest cover percentage
    estimateForestCover(ndvi) {
        if (ndvi >= 0.7) return Math.round((60 + Math.random() * 30) * 10) / 10; // 60-90%
        if (ndvi >= 0.5) return Math.round((30 + Math.random() * 30) * 10) / 10; // 30-60%
        if (ndvi >= 0.3) return Math.round((10 + Math.random() * 20) * 10) / 10; // 10-30%
        return Math.round(Math.random() * 10 * 10) / 10; // 0-10%
    }

    // Estimate crop health
    estimateCropHealth(ndvi) {
        if (ndvi >= 0.6) return 'Healthy crops detected';
        if (ndvi >= 0.4) return 'Moderate crop health';
        if (ndvi >= 0.2) return 'Stressed vegetation';
        return 'Poor crop conditions';
    }

    // Estimate urban green space
    estimateUrbanGreenSpace(ndvi) {
        const greenSpace = ndvi * 100; // Convert to percentage
        return `${Math.round(greenSpace)}% green coverage`;
    }

    // Get seasonal variation info
    getSeasonalVariation() {
        const month = new Date().getMonth();
        const seasons = {
            0: 'Winter - Lower vegetation activity',
            1: 'Winter - Lower vegetation activity', 
            2: 'Spring - Vegetation awakening',
            3: 'Spring - Growing season begins',
            4: 'Spring - Peak growth period',
            5: 'Summer - Maximum vegetation',
            6: 'Summer - Maximum vegetation',
            7: 'Summer - Peak photosynthesis',
            8: 'Autumn - Vegetation maturity',
            9: 'Autumn - Senescence begins',
            10: 'Autumn - Leaf fall period',
            11: 'Winter - Dormancy period'
        };
        
        return seasons[month] || 'Seasonal data unavailable';
    }

    // Get vegetation recommendations
    getVegetationRecommendations(ndvi) {
        const recommendations = [];
        
        if (ndvi < 0.3) {
            recommendations.push(
                'Consider reforestation initiatives',
                'Implement soil conservation measures',
                'Plant drought-resistant species',
                'Improve irrigation systems'
            );
        } else if (ndvi < 0.6) {
            recommendations.push(
                'Maintain existing vegetation',
                'Add native plant species',
                'Implement sustainable farming practices',
                'Monitor for pest and disease'
            );
        } else {
            recommendations.push(
                'Preserve existing forest cover',
                'Promote eco-tourism',
                'Maintain biodiversity',
                'Continue conservation efforts'
            );
        }
        
        return recommendations;
    }

    // Get NDVI data for multiple areas (batch processing)
    async getBatchNDVIData(areaIds) {
        const results = [];
        
        for (const areaId of areaIds) {
            try {
                const ndviData = await this.getNDVIData(areaId);
                results.push(ndviData);
            } catch (error) {
                console.error(`Error processing area ${areaId}:`, error.message);
                results.push({
                    areaId: areaId,
                    error: error.message,
                    date: new Date().toISOString()
                });
            }
        }
        
        return {
            totalAreas: areaIds.length,
            processedAreas: results.length,
            results: results,
            date: new Date().toISOString()
        };
    }
}

module.exports = new NDVIService();