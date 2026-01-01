const axios = require('axios');
require('dotenv').config();

class EnvironmentalService {
    constructor() {
        this.openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
        this.baseUrl = 'http://api.openweathermap.org/data/2.5';
        
        if (!this.openWeatherApiKey) {
            console.error('OPENWEATHER_API_KEY not found in environment variables');
        }
    }

    // Get carbon emissions data (using weather data as proxy + calculations)
    async getCarbonEmissions(city) {
        try {
            // Get weather data to calculate carbon footprint estimates
            const weatherResponse = await axios.get(`${this.baseUrl}/weather`, {
                params: {
                    q: city,
                    appid: this.openWeatherApiKey,
                    units: 'metric'
                }
            });

            const { main, wind, visibility } = weatherResponse.data;
            
            // Calculate estimated carbon emissions based on weather patterns
            // This is a simplified model - in production you'd use real carbon emission APIs
            const baseEmission = 45.2; // Base CO2 tons per capita
            const temperatureFactor = main.temp > 30 ? 1.2 : main.temp < 10 ? 1.15 : 1.0;
            const humidityFactor = main.humidity > 80 ? 0.95 : 1.0;
            const windFactor = wind.speed > 5 ? 0.9 : 1.1;
            
            const estimatedEmission = baseEmission * temperatureFactor * humidityFactor * windFactor;
            
            // Calculate trend (simplified)
            const trend = Math.random() > 0.5 ? 'increasing' : 'decreasing';
            const changePercent = (Math.random() * 10 - 5).toFixed(1); // -5% to +5%

            // Generate carbon breakdown by sector
            const carbonBreakdown = this.generateCarbonBreakdown(estimatedEmission, main.temp);

            return {
                city: city,
                carbonEmission: Math.round(estimatedEmission * 100) / 100,
                unit: 'tons CO2/year per capita',
                trend: trend,
                changePercent: changePercent,
                date: new Date().toISOString(),
                factors: {
                    temperature: main.temp,
                    humidity: main.humidity,
                    windSpeed: wind.speed,
                    visibility: visibility
                },
                breakdown: carbonBreakdown,
                recommendations: [
                    'Use public transportation',
                    'Switch to renewable energy',
                    'Reduce meat consumption',
                    'Improve home insulation'
                ],
                source: 'Calculated from OpenWeather data'
            };
        } catch (error) {
            console.error(`Error fetching carbon emissions for ${city}:`, error.message);
            
            // Fallback data
            return {
                city: city,
                carbonEmission: 42.5,
                unit: 'tons CO2/year per capita',
                trend: 'stable',
                changePercent: '0.0',
                date: new Date().toISOString(),
                breakdown: this.generateCarbonBreakdown(42.5, 25),
                error: 'Using fallback data - API unavailable',
                source: 'Fallback estimate'
            };
        }
    }

    // Get water stress data (using weather data as proxy)
    async getWaterStress(city) {
        try {
            // Get weather data to estimate water stress
            const weatherResponse = await axios.get(`${this.baseUrl}/weather`, {
                params: {
                    q: city,
                    appid: this.openWeatherApiKey,
                    units: 'metric'
                }
            });

            const { main, weather } = weatherResponse.data;
            
            // Calculate water stress index based on weather conditions
            let stressLevel = 'Low';
            let stressValue = 2.5;
            
            // High temperature increases water stress
            if (main.temp > 35) {
                stressLevel = 'High';
                stressValue = 4.2;
            } else if (main.temp > 25) {
                stressLevel = 'Medium';
                stressValue = 3.1;
            }
            
            // Low humidity increases stress
            if (main.humidity < 30) {
                stressValue += 0.8;
                stressLevel = 'High';
            }
            
            // Check for rain (reduces stress)
            const hasRain = weather.some(w => w.main.toLowerCase().includes('rain'));
            if (hasRain) {
                stressValue -= 0.5;
                if (stressValue < 2.0) stressLevel = 'Low';
            }

            return {
                city: city,
                waterStress: Math.round(stressValue * 10) / 10,
                level: stressLevel,
                unit: 'Water Stress Index (0-5)',
                date: new Date().toISOString(),
                factors: {
                    temperature: main.temp,
                    humidity: main.humidity,
                    precipitation: hasRain ? 'Yes' : 'No',
                    pressure: main.pressure
                },
                recommendations: [
                    'Install rainwater harvesting',
                    'Use drip irrigation',
                    'Fix water leaks promptly',
                    'Choose drought-resistant plants'
                ],
                source: 'Calculated from OpenWeather data'
            };
        } catch (error) {
            console.error(`Error fetching water stress for ${city}:`, error.message);
            
            // Fallback data
            return {
                city: city,
                waterStress: 2.8,
                level: 'Medium',
                unit: 'Water Stress Index (0-5)',
                date: new Date().toISOString(),
                error: 'Using fallback data - API unavailable',
                source: 'Fallback estimate'
            };
        }
    }

    // Get pollution forecast
    async getPollutionForecast(city) {
        try {
            // Get coordinates first
            const coordResponse = await axios.get(`${this.baseUrl}/weather`, {
                params: {
                    q: city,
                    appid: this.openWeatherApiKey
                }
            });

            const { lat, lon } = coordResponse.data.coord;

            // Get 5-day weather forecast (OpenWeather doesn't have pollution forecast in free tier)
            const forecastResponse = await axios.get(`${this.baseUrl}/forecast`, {
                params: {
                    lat: lat,
                    lon: lon,
                    appid: this.openWeatherApiKey,
                    units: 'metric'
                }
            });

            // Generate pollution forecast based on weather patterns
            const forecast = forecastResponse.data.list.slice(0, 7).map((item, index) => {
                const temp = item.main.temp;
                const humidity = item.main.humidity;
                const windSpeed = item.wind.speed;
                
                // Estimate AQI based on weather conditions
                let estimatedAQI = 75; // Base AQI
                
                // High temperature increases pollution
                if (temp > 30) estimatedAQI += 25;
                else if (temp > 20) estimatedAQI += 10;
                
                // Low wind speed increases pollution
                if (windSpeed < 2) estimatedAQI += 20;
                else if (windSpeed < 5) estimatedAQI += 10;
                
                // High humidity can reduce some pollutants
                if (humidity > 70) estimatedAQI -= 10;
                
                // Add some randomness for variation
                estimatedAQI += Math.random() * 20 - 10;
                estimatedAQI = Math.max(20, Math.min(200, Math.round(estimatedAQI)));

                return {
                    date: item.dt_txt,
                    aqi: estimatedAQI,
                    level: estimatedAQI < 50 ? 'Good' : estimatedAQI < 100 ? 'Moderate' : 'Unhealthy',
                    temperature: Math.round(temp),
                    humidity: humidity,
                    windSpeed: windSpeed,
                    weather: item.weather[0].description
                };
            });

            return {
                city: city,
                forecast: forecast,
                source: 'Estimated from OpenWeather forecast data',
                date: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Error fetching pollution forecast for ${city}:`, error.message);
            
            // Fallback forecast
            const fallbackForecast = Array.from({ length: 7 }, (_, i) => ({
                date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
                aqi: 75 + Math.random() * 50,
                level: 'Moderate',
                temperature: 25,
                humidity: 60,
                windSpeed: 3,
                weather: 'partly cloudy'
            }));

            return {
                city: city,
                forecast: fallbackForecast,
                source: 'Fallback data',
                error: 'API unavailable',
                date: new Date().toISOString()
            };
        }
    }

    // Get environmental recommendations based on current conditions
    async getRecommendations(city, riskLevel = 0.8) {
        try {
            // Get current weather, AQI, and carbon data for comprehensive analysis
            const [weatherResponse, aqiData, carbonData] = await Promise.all([
                axios.get(`${this.baseUrl}/weather`, {
                    params: {
                        q: city,
                        appid: this.openWeatherApiKey,
                        units: 'metric'
                    }
                }),
                this.getAQIDataForRecommendations(city),
                this.getCarbonEmissions(city)
            ]);

            const { main, weather } = weatherResponse.data;
            const recommendations = [];

            // Generate personalized recommendations based on city-specific data
            const personalizedRecs = this.generatePersonalizedRecommendations(
                city, 
                aqiData, 
                carbonData, 
                main, 
                weather, 
                riskLevel
            );

            recommendations.push(...personalizedRecs);

            return {
                city: city,
                recommendations: recommendations,
                riskLevel: riskLevel,
                date: new Date().toISOString(),
                source: 'Generated from current environmental conditions',
                analysis: {
                    aqi: aqiData?.aqi || 'N/A',
                    carbonEmission: carbonData?.carbonEmission || 'N/A',
                    temperature: main.temp,
                    humidity: main.humidity,
                    conditions: weather[0]?.description || 'N/A'
                }
            };
        } catch (error) {
            console.error(`Error generating recommendations for ${city}:`, error.message);
            
            // Fallback recommendations
            return {
                city: city,
                recommendations: this.getFallbackRecommendations(city),
                riskLevel: riskLevel,
                date: new Date().toISOString(),
                source: 'Fallback recommendations'
            };
        }
    }

    // Get AQI data specifically for recommendations (simplified version)
    async getAQIDataForRecommendations(city) {
        try {
            const coordResponse = await axios.get(`${this.baseUrl}/weather`, {
                params: {
                    q: city,
                    appid: this.openWeatherApiKey
                }
            });

            const { lat, lon } = coordResponse.data.coord;

            const response = await axios.get(`${this.baseUrl}/air_pollution`, {
                params: {
                    lat: lat,
                    lon: lon,
                    appid: this.openWeatherApiKey
                }
            });

            const pollutionData = response.data.list[0];
            const components = pollutionData.components;
            
            // Simplified AQI calculation for recommendations
            const pm25AQI = this.calculateSimpleAQI(components.pm2_5, 'pm25');
            const pm10AQI = this.calculateSimpleAQI(components.pm10, 'pm10');
            const no2AQI = this.calculateSimpleAQI(components.no2, 'no2');
            
            const aqi = Math.max(pm25AQI, pm10AQI, no2AQI);
            
            return {
                aqi: aqi,
                components: components,
                mainPollutant: pm25AQI >= pm10AQI && pm25AQI >= no2AQI ? 'PM2.5' : 
                              pm10AQI >= no2AQI ? 'PM10' : 'NO2'
            };
        } catch (error) {
            console.log(`Could not get AQI for recommendations: ${error.message}`);
            return null;
        }
    }

    // Simplified AQI calculation for recommendations
    calculateSimpleAQI(value, pollutant) {
        if (!value) return 50;
        
        switch (pollutant) {
            case 'pm25':
                if (value <= 12) return 50;
                if (value <= 35) return 100;
                if (value <= 55) return 150;
                return 200;
            case 'pm10':
                if (value <= 54) return 50;
                if (value <= 154) return 100;
                if (value <= 254) return 150;
                return 200;
            case 'no2':
                if (value <= 40) return 50;
                if (value <= 80) return 100;
                if (value <= 180) return 150;
                return 200;
            default:
                return 75;
        }
    }

    // Generate personalized recommendations based on city-specific environmental data
    generatePersonalizedRecommendations(city, aqiData, carbonData, weather, weatherConditions, riskLevel) {
        const recommendations = [];
        const aqi = aqiData?.aqi || 75;
        const carbonEmission = carbonData?.carbonEmission || 45;
        const breakdown = carbonData?.breakdown || [];
        const temp = weather.temp;
        const humidity = weather.humidity;

        // AQI-based recommendations
        if (aqi > 150) {
            recommendations.push({
                title: `🚨 High Pollution Alert for ${city}`,
                impact: 'High',
                detail: `AQI is ${aqi} (Unhealthy). Stay indoors, use air purifiers, wear N95 masks outdoors, and avoid outdoor exercise. Consider relocating temporarily if possible.`,
                category: 'health',
                priority: 1
            });
            
            recommendations.push({
                title: '🏠 Indoor Air Quality Protection',
                impact: 'High',
                detail: `Keep windows closed, use HEPA air purifiers, add indoor plants like snake plants and peace lilies. Avoid cooking with gas stoves during high pollution days.`,
                category: 'indoor',
                priority: 1
            });
        } else if (aqi > 100) {
            recommendations.push({
                title: `⚠️ Moderate Pollution in ${city}`,
                impact: 'Medium',
                detail: `AQI is ${aqi} (Moderate). Limit prolonged outdoor activities, especially for sensitive groups. Consider wearing masks during peak traffic hours.`,
                category: 'health',
                priority: 2
            });
        } else if (aqi <= 50) {
            recommendations.push({
                title: `✅ Good Air Quality in ${city}`,
                impact: 'Low',
                detail: `AQI is ${aqi} (Good). Perfect time for outdoor activities! Consider cycling, walking, or outdoor exercise to maintain this healthy environment.`,
                category: 'outdoor',
                priority: 3
            });
        }

        // Carbon emission-based recommendations
        if (carbonEmission > 50) {
            recommendations.push({
                title: `🔥 High Carbon Footprint Alert`,
                impact: 'High',
                detail: `${city} has ${carbonEmission} tons CO2/capita (above average). Focus on renewable energy, public transport, and energy-efficient appliances to reduce impact.`,
                category: 'carbon',
                priority: 1
            });
        }

        // Sector-specific recommendations based on carbon breakdown
        if (breakdown.length > 0) {
            const topSector = breakdown.reduce((max, sector) => 
                sector.percentage > max.percentage ? sector : max
            );

            switch (topSector.sector) {
                case 'Transportation':
                    recommendations.push({
                        title: `🚗 Transportation Focus for ${city}`,
                        impact: 'High',
                        detail: `Transportation accounts for ${topSector.percentage}% of emissions. Use metro/bus, carpool, cycle, or walk. Consider electric vehicles for long-term impact.`,
                        category: 'transport',
                        priority: 1
                    });
                    break;
                case 'Energy Production':
                    recommendations.push({
                        title: `⚡ Energy Efficiency Priority`,
                        impact: 'High',
                        detail: `Energy production is ${topSector.percentage}% of emissions. Switch to LED bulbs, use solar panels, unplug devices, and choose renewable energy providers.`,
                        category: 'energy',
                        priority: 1
                    });
                    break;
                case 'Industry':
                    recommendations.push({
                        title: `🏭 Industrial Impact Awareness`,
                        impact: 'Medium',
                        detail: `Industry contributes ${topSector.percentage}% of emissions. Support eco-friendly brands, buy local products, and advocate for cleaner industrial practices.`,
                        category: 'consumption',
                        priority: 2
                    });
                    break;
            }
        }

        // Weather-specific recommendations
        if (temp > 35) {
            recommendations.push({
                title: `🌡️ Extreme Heat Management`,
                impact: 'High',
                detail: `Temperature is ${temp}°C. Use AC efficiently (26°C setting), stay hydrated, avoid outdoor activities 10AM-4PM. Plant trees for natural cooling.`,
                category: 'weather',
                priority: 1
            });
        } else if (temp < 10) {
            recommendations.push({
                title: `❄️ Cold Weather Energy Tips`,
                impact: 'Medium',
                detail: `Temperature is ${temp}°C. Use efficient heating, wear layers, seal windows/doors. Consider solar heating and energy-efficient appliances.`,
                category: 'weather',
                priority: 2
            });
        }

        // Humidity-based recommendations
        if (humidity < 30) {
            recommendations.push({
                title: '💧 Low Humidity Alert',
                impact: 'Medium',
                detail: `Humidity is ${humidity}%. Use humidifiers, keep water bowls indoors, avoid overuse of heaters. Low humidity can worsen air pollution effects.`,
                category: 'comfort',
                priority: 2
            });
        } else if (humidity > 80) {
            recommendations.push({
                title: '🌫️ High Humidity Management',
                impact: 'Medium',
                detail: `Humidity is ${humidity}%. Use dehumidifiers, ensure ventilation, prevent mold growth. High humidity can trap pollutants indoors.`,
                category: 'comfort',
                priority: 2
            });
        }

        // City-specific recommendations based on known characteristics
        const citySpecificRecs = this.getCitySpecificRecommendations(city, aqi, carbonEmission);
        recommendations.push(...citySpecificRecs);

        // Seasonal recommendations
        const seasonalRecs = this.getSeasonalRecommendations(city, new Date().getMonth(), temp);
        recommendations.push(...seasonalRecs);

        // Sort by priority and return top recommendations
        return recommendations
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 8); // Limit to 8 most relevant recommendations
    }

    // City-specific recommendations based on known environmental challenges
    getCitySpecificRecommendations(city, aqi, carbonEmission) {
        const cityLower = city.toLowerCase();
        const recommendations = [];

        if (cityLower.includes('delhi')) {
            recommendations.push({
                title: '🚭 Delhi Smog Protection',
                impact: 'High',
                detail: 'Delhi faces severe winter smog. Use air purifiers, avoid morning walks during smog season, support odd-even vehicle schemes, and plant native trees.',
                category: 'city-specific',
                priority: 1
            });
        } else if (cityLower.includes('mumbai')) {
            recommendations.push({
                title: '🌊 Mumbai Coastal Conservation',
                impact: 'Medium',
                detail: 'Protect Mumbai\'s coastline by reducing plastic use, supporting mangrove conservation, using local trains, and participating in beach cleanups.',
                category: 'city-specific',
                priority: 2
            });
        } else if (cityLower.includes('bangalore') || cityLower.includes('bengaluru')) {
            recommendations.push({
                title: '🌳 Bangalore Green Cover',
                impact: 'Medium',
                detail: 'Preserve Bangalore\'s garden city status by planting native trees, supporting lake restoration, using metro/buses, and rainwater harvesting.',
                category: 'city-specific',
                priority: 2
            });
        } else if (cityLower.includes('chennai')) {
            recommendations.push({
                title: '💧 Chennai Water Conservation',
                impact: 'High',
                detail: 'Address Chennai\'s water challenges through rainwater harvesting, greywater recycling, drought-resistant gardening, and supporting desalination projects.',
                category: 'city-specific',
                priority: 1
            });
        } else if (cityLower.includes('kolkata')) {
            recommendations.push({
                title: '🏭 Kolkata Industrial Balance',
                impact: 'Medium',
                detail: 'Balance Kolkata\'s industrial growth with environment by supporting clean industries, using public transport, and preserving wetlands.',
                category: 'city-specific',
                priority: 2
            });
        }

        return recommendations;
    }

    // Seasonal recommendations based on month and temperature
    getSeasonalRecommendations(city, month, temperature) {
        const recommendations = [];

        // Winter months (Nov-Feb)
        if (month >= 10 || month <= 1) {
            if (temperature < 15) {
                recommendations.push({
                    title: '❄️ Winter Energy Efficiency',
                    impact: 'Medium',
                    detail: 'Use efficient heating, solar water heaters, warm clothing layers. Winter increases energy consumption - optimize heating schedules.',
                    category: 'seasonal',
                    priority: 2
                });
            }
            
            recommendations.push({
                title: '🌫️ Winter Air Quality Care',
                impact: 'High',
                detail: 'Winter traps pollutants. Avoid burning waste, use cleaner cooking fuels, support stubble burning alternatives, and monitor AQI daily.',
                category: 'seasonal',
                priority: 1
            });
        }
        
        // Summer months (Mar-Jun)
        else if (month >= 2 && month <= 5) {
            recommendations.push({
                title: '☀️ Summer Cooling Efficiency',
                impact: 'High',
                detail: 'Use AC at 26°C, install solar panels, plant shade trees, use natural ventilation. Summer increases cooling energy demand significantly.',
                category: 'seasonal',
                priority: 1
            });
            
            if (temperature > 30) {
                recommendations.push({
                    title: '🌡️ Heat Wave Preparation',
                    impact: 'High',
                    detail: 'Stay hydrated, avoid peak sun hours, use reflective roofing, create green spaces. Extreme heat increases health risks and energy consumption.',
                    category: 'seasonal',
                    priority: 1
                });
            }
        }
        
        // Monsoon months (Jun-Sep)
        else if (month >= 5 && month <= 8) {
            recommendations.push({
                title: '🌧️ Monsoon Water Management',
                impact: 'Medium',
                detail: 'Harvest rainwater, prevent waterlogging, avoid water contamination, support flood management. Monsoon is crucial for water security.',
                category: 'seasonal',
                priority: 2
            });
        }

        return recommendations;
    }

    // Fallback recommendations when API calls fail
    getFallbackRecommendations(city) {
        return [
            {
                title: `🌱 General Environmental Action for ${city}`,
                impact: 'High',
                detail: 'Use public transportation, switch to renewable energy, reduce plastic use, and support local environmental initiatives.'
            },
            {
                title: '💡 Energy Conservation',
                impact: 'Medium',
                detail: 'Switch to LED bulbs, unplug devices when not in use, and choose energy-efficient appliances to reduce carbon footprint.'
            },
            {
                title: '🚶 Sustainable Transportation',
                impact: 'High',
                detail: 'Walk, cycle, or use public transport for short distances. Consider carpooling or electric vehicles for longer trips.'
            }
        ];
    }

    // Generate carbon breakdown by sector
    generateCarbonBreakdown(totalEmission, temperature) {
        // Base percentages for different sectors
        let sectors = {
            'Transportation': 28,
            'Energy Production': 25,
            'Industry': 21,
            'Agriculture': 12,
            'Buildings': 8,
            'Waste Management': 6
        };

        // Adjust based on temperature (hot weather = more energy for cooling)
        if (temperature > 30) {
            sectors['Energy Production'] += 5;
            sectors['Buildings'] += 3;
            sectors['Transportation'] -= 4;
            sectors['Industry'] -= 4;
        } else if (temperature < 15) {
            sectors['Energy Production'] += 3;
            sectors['Buildings'] += 4;
            sectors['Transportation'] -= 3;
            sectors['Agriculture'] -= 4;
        }

        // Add some randomness for variation
        Object.keys(sectors).forEach(sector => {
            const variation = (Math.random() - 0.5) * 6; // ±3% variation
            sectors[sector] = Math.max(1, Math.min(40, sectors[sector] + variation));
        });

        // Normalize to 100%
        const total = Object.values(sectors).reduce((sum, val) => sum + val, 0);
        Object.keys(sectors).forEach(sector => {
            sectors[sector] = Math.round((sectors[sector] / total) * 100 * 10) / 10;
        });

        // Convert to array format with emissions
        return Object.entries(sectors).map(([sector, percentage]) => ({
            sector: sector,
            percentage: percentage,
            emissions: Math.round((totalEmission * percentage / 100) * 100) / 100,
            unit: 'tons CO2/year'
        }));
    }
}

module.exports = new EnvironmentalService();