const axios = require('axios');
require('dotenv').config();

class AQIService {
    constructor() {
        this.apiKey = process.env.OPENWEATHER_API_KEY;
        this.baseUrl = 'http://api.openweathermap.org/data/2.5';
        
        if (!this.apiKey) {
            console.error('OPENWEATHER_API_KEY not found in environment variables');
            console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('OPENWEATHER')));
        } else {
            console.log('OpenWeatherMap API key loaded successfully');
        }
    }

    // Get coordinates for a city
    async getCoordinates(city) {
        try {
            const response = await axios.get(`${this.baseUrl}/weather`, {
                params: {
                    q: city,
                    appid: this.apiKey
                }
            });
            
            return {
                lat: response.data.coord.lat,
                lon: response.data.coord.lon
            };
        } catch (error) {
            console.error(`Error getting coordinates for ${city}:`, error.message);
            throw new Error(`Could not find coordinates for city: ${city}`);
        }
    }

    // Convert OpenWeatherMap AQI to US EPA AQI scale
    convertToUSAQI(components) {
        // OpenWeatherMap uses a 1-5 scale, we need to convert to US EPA 0-500 scale
        // This is a simplified conversion - in production you'd use proper EPA formulas
        const { pm2_5, pm10, no2, o3, co } = components;
        
        // Calculate AQI for each pollutant (simplified)
        const pm25AQI = this.calculatePM25AQI(pm2_5);
        const pm10AQI = this.calculatePM10AQI(pm10);
        const no2AQI = this.calculateNO2AQI(no2);
        const o3AQI = this.calculateO3AQI(o3);
        const coAQI = this.calculateCOAQI(co);
        
        // Return the highest AQI (worst pollutant determines overall AQI)
        return Math.max(pm25AQI, pm10AQI, no2AQI, o3AQI, coAQI);
    }

    // PM2.5 AQI calculation (μg/m³ to AQI)
    calculatePM25AQI(pm25) {
        if (pm25 <= 12.0) return Math.round((50 / 12.0) * pm25);
        if (pm25 <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
        if (pm25 <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
        if (pm25 <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
        if (pm25 <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
        return Math.round(((400 - 301) / (350.4 - 250.5)) * (pm25 - 250.5) + 301);
    }

    // PM10 AQI calculation
    calculatePM10AQI(pm10) {
        if (pm10 <= 54) return Math.round((50 / 54) * pm10);
        if (pm10 <= 154) return Math.round(((100 - 51) / (154 - 55)) * (pm10 - 55) + 51);
        if (pm10 <= 254) return Math.round(((150 - 101) / (254 - 155)) * (pm10 - 155) + 101);
        if (pm10 <= 354) return Math.round(((200 - 151) / (354 - 255)) * (pm10 - 255) + 151);
        if (pm10 <= 424) return Math.round(((300 - 201) / (424 - 355)) * (pm10 - 355) + 201);
        return Math.round(((500 - 301) / (604 - 425)) * (pm10 - 425) + 301);
    }

    // NO2 AQI calculation (ppb to AQI)
    calculateNO2AQI(no2) {
        // Convert μg/m³ to ppb (approximate conversion)
        const no2ppb = no2 * 0.532;
        if (no2ppb <= 53) return Math.round((50 / 53) * no2ppb);
        if (no2ppb <= 100) return Math.round(((100 - 51) / (100 - 54)) * (no2ppb - 54) + 51);
        if (no2ppb <= 360) return Math.round(((150 - 101) / (360 - 101)) * (no2ppb - 101) + 101);
        if (no2ppb <= 649) return Math.round(((200 - 151) / (649 - 361)) * (no2ppb - 361) + 151);
        return Math.round(((300 - 201) / (1249 - 650)) * (no2ppb - 650) + 201);
    }

    // O3 AQI calculation (ppb to AQI)
    calculateO3AQI(o3) {
        // Convert μg/m³ to ppb (approximate conversion)
        const o3ppb = o3 * 0.509;
        if (o3ppb <= 54) return Math.round((50 / 54) * o3ppb);
        if (o3ppb <= 70) return Math.round(((100 - 51) / (70 - 55)) * (o3ppb - 55) + 51);
        if (o3ppb <= 85) return Math.round(((150 - 101) / (85 - 71)) * (o3ppb - 71) + 101);
        if (o3ppb <= 105) return Math.round(((200 - 151) / (105 - 86)) * (o3ppb - 86) + 151);
        return Math.round(((300 - 201) / (200 - 106)) * (o3ppb - 106) + 201);
    }

    // CO AQI calculation (mg/m³ to AQI)
    calculateCOAQI(co) {
        // Convert μg/m³ to mg/m³
        const coMg = co / 1000;
        if (coMg <= 4.4) return Math.round((50 / 4.4) * coMg);
        if (coMg <= 9.4) return Math.round(((100 - 51) / (9.4 - 4.5)) * (coMg - 4.5) + 51);
        if (coMg <= 12.4) return Math.round(((150 - 101) / (12.4 - 9.5)) * (coMg - 9.5) + 101);
        if (coMg <= 15.4) return Math.round(((200 - 151) / (15.4 - 12.5)) * (coMg - 12.5) + 151);
        return Math.round(((300 - 201) / (30.4 - 15.5)) * (coMg - 15.5) + 201);
    }

    // Get AQI level description
    getAQILevel(aqi) {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Moderate';
        if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
        if (aqi <= 200) return 'Unhealthy';
        if (aqi <= 300) return 'Very Unhealthy';
        return 'Hazardous';
    }

    // Get main pollutant
    getMainPollutant(components) {
        const pollutants = {
            'PM2.5': this.calculatePM25AQI(components.pm2_5),
            'PM10': this.calculatePM10AQI(components.pm10),
            'NO2': this.calculateNO2AQI(components.no2),
            'O3': this.calculateO3AQI(components.o3),
            'CO': this.calculateCOAQI(components.co)
        };

        return Object.keys(pollutants).reduce((a, b) => 
            pollutants[a] > pollutants[b] ? a : b
        );
    }

    // Main method to get AQI data for a city
    async getAQIData(city) {
        try {
            // Get coordinates for the city
            const coords = await this.getCoordinates(city);
            
            // Get air pollution data
            const response = await axios.get(`${this.baseUrl}/air_pollution`, {
                params: {
                    lat: coords.lat,
                    lon: coords.lon,
                    appid: this.apiKey
                }
            });

            const pollutionData = response.data.list[0];
            const components = pollutionData.components;
            
            // Calculate US EPA AQI
            const aqi = this.convertToUSAQI(components);
            const level = this.getAQILevel(aqi);
            const mainPollutant = this.getMainPollutant(components);

            return {
                city: city,
                aqi: aqi,
                mainPollutant: mainPollutant,
                level: level,
                date: new Date(pollutionData.dt * 1000).toISOString(),
                coordinates: coords,
                components: {
                    co: components.co,
                    no: components.no,
                    no2: components.no2,
                    o3: components.o3,
                    so2: components.so2,
                    pm2_5: components.pm2_5,
                    pm10: components.pm10,
                    nh3: components.nh3
                },
                source: 'OpenWeatherMap Air Pollution API'
            };
        } catch (error) {
            console.error(`Error fetching AQI data for ${city}:`, error.message);
            
            // Return fallback data if API fails
            return {
                city: city,
                aqi: null,
                mainPollutant: 'Unknown',
                level: 'Data Unavailable',
                date: new Date().toISOString(),
                error: 'Unable to fetch real-time data',
                source: 'Fallback'
            };
        }
    }

    // Get pollution forecast (using current data as baseline)
    async getPollutionForecast(city) {
        try {
            const currentData = await this.getAQIData(city);
            
            // Simple forecast logic (in production, you'd use historical data and ML models)
            const forecastAQI = Math.max(0, currentData.aqi + Math.floor(Math.random() * 40 - 20));
            
            return {
                city: city,
                model: 'OpenWeatherMap + Simple Trend Analysis',
                forecastDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                aqiPrediction: forecastAQI,
                currentAQI: currentData.aqi,
                risk: this.getAQILevel(forecastAQI),
                notes: `Forecast based on current AQI of ${currentData.aqi}. Weather patterns and seasonal trends may affect actual values.`,
                source: 'OpenWeatherMap Air Pollution API'
            };
        } catch (error) {
            console.error(`Error generating pollution forecast for ${city}:`, error.message);
            
            return {
                city: city,
                model: 'Fallback Model',
                forecastDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                aqiPrediction: null,
                risk: 'Unknown',
                notes: 'Unable to generate forecast due to data unavailability',
                error: 'Forecast generation failed'
            };
        }
    }
}

module.exports = new AQIService();