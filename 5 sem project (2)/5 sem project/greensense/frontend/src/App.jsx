import React, { useState, useEffect, useCallback } from 'react';
// The error was caused by this import: lucide-react was not installed.
import { Leaf, Cloud, Trees, Droplets, Zap, TrendingUp, Sun, Moon } from 'lucide-react'; 
import { apiService } from './utils/api';

// NOTE: Ensure your backend is running on http://localhost:3000 before testing.
const DEFAULT_CITY = 'Mumbai';

// Utility component to display key metrics
const DashboardCard = ({ icon: Icon, title, value, unit, status, colorClass }) => {
  // colorClass is now the primary class (e.g., 'border-b-green-500')
  // We extract the base color for the background element.
  const baseColor = colorClass.split('-')[2]; // e.g., '500' -> 'green'
  const bgColorClass = `bg-${baseColor}-500`;

  return (
    <div className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl bg-white border-b-4 ${colorClass}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          {/* Use explicit Tailwind classes for background to ensure it renders */}
          <div className={`p-3 rounded-full bg-opacity-20 text-white ${bgColorClass}`}>
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full text-white ${bgColorClass}`}>
          {status}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-4xl font-bold text-gray-900">
          {value}
          <span className="text-xl font-normal ml-1 text-gray-500">{unit}</span>
        </p>
      </div>
    </div>
  );
};

// Component for displaying Recommendation Cards
const RecommendationCard = ({ title, impact, detail, category, priority }) => {
  let impactColor = 'bg-yellow-500';
  if (impact === 'High') impactColor = 'bg-red-500';
  if (impact === 'Medium') impactColor = 'bg-orange-500';
  if (impact === 'Low') impactColor = 'bg-green-500';

  // Category icons and colors
  const categoryConfig = {
    'health': { icon: '🏥', color: 'bg-red-100 text-red-800' },
    'indoor': { icon: '🏠', color: 'bg-blue-100 text-blue-800' },
    'outdoor': { icon: '🌳', color: 'bg-green-100 text-green-800' },
    'carbon': { icon: '🔥', color: 'bg-orange-100 text-orange-800' },
    'transport': { icon: '🚗', color: 'bg-purple-100 text-purple-800' },
    'energy': { icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
    'consumption': { icon: '🛒', color: 'bg-indigo-100 text-indigo-800' },
    'weather': { icon: '🌡️', color: 'bg-cyan-100 text-cyan-800' },
    'comfort': { icon: '💧', color: 'bg-teal-100 text-teal-800' },
    'city-specific': { icon: '🏙️', color: 'bg-pink-100 text-pink-800' },
    'seasonal': { icon: '📅', color: 'bg-emerald-100 text-emerald-800' },
    'default': { icon: '💡', color: 'bg-gray-100 text-gray-800' }
  };

  const config = categoryConfig[category] || categoryConfig['default'];

  return (
    <div className={`p-4 bg-white rounded-lg shadow border border-gray-100 ${priority === 1 ? 'ring-2 ring-emerald-200' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {category && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${config.color}`}>
              {config.icon} {category.replace('-', ' ').toUpperCase()}
            </span>
          )}
          {priority === 1 && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-800">
              🚨 PRIORITY
            </span>
          )}
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${impactColor}`}>
          {impact} Impact
        </span>
      </div>
      <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{detail}</p>
    </div>
  );
};


// Main Application Component
const App = () => {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [inputCity, setInputCity] = useState(DEFAULT_CITY);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    aqi: null,
    carbon: null,
    water: null,
    ndvi: null,
    forecast: null,
    recommendations: [],
  });
  const [error, setError] = useState(null);

  // Function to fetch data from a specific endpoint
  const fetchEndpoint = useCallback(async (path) => {
    try {
      const response = await fetch(`http://localhost:3000/api/${path}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} for ${path}`);
      }
      return await response.json();
    } catch (e) {
      console.error(`Failed to fetch ${path}:`, e.message);
      return null;
    }
  }, []);

  // Main data fetching logic using new API service
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      
      const areaParam = 'Amazon-Basin-01'; // Mock Area ID for NDVI

      try {
        // Fetch all required data points concurrently using the API service
        const [aqi, carbon, water, ndvi, forecast, recommendations] = await Promise.all([
          apiService.getAQI(city),
          apiService.getCarbonEmissions(city),
          apiService.getWaterStress(city),
          apiService.getNDVI(areaParam, city),
          apiService.getPollutionForecast(city),
          apiService.getRecommendations(city, 0.8),
        ]);
        
        if (!aqi || !carbon || !forecast) {
            // If core data is missing, log error but allow partial loading
            console.error(`Missing core data: AQI=${!!aqi}, Carbon=${!!carbon}, Forecast=${!!forecast}`);
        }

        setData({
          aqi,
          carbon,
          water,
          ndvi,
          forecast,
          recommendations: recommendations || { recommendations: [] },
        });
      } catch (error) {
        console.error('Error loading environmental data:', error);
        setError(`Failed to load environmental data for ${city}. Please check your connection and try again.`);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [city]);

  const handleCityChange = (e) => {
    e.preventDefault();
    if (inputCity.trim() && inputCity !== city) {
      setCity(inputCity.trim());
    }
  };

  const getAqiColor = (aqiValue) => {
    if (aqiValue < 50) return 'border-b-green-500';
    if (aqiValue < 100) return 'border-b-yellow-500';
    if (aqiValue < 150) return 'border-b-orange-500';
    return 'border-b-red-500';
  };

  const getAqiStatus = (aqiValue) => {
    if (aqiValue < 50) return 'Good';
    if (aqiValue < 100) return 'Moderate';
    if (aqiValue < 150) return 'Unhealthy for Sensitive Groups';
    if (aqiValue < 200) return 'Unhealthy';
    return 'Very Unhealthy';
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Header */}
      <header className="bg-emerald-600 shadow-md p-4 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center">
            <Leaf className="w-7 h-7 mr-2" />
            GreenSense Dashboard
          </h1>
          <form onSubmit={handleCityChange} className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter City"
              value={inputCity}
              onChange={(e) => setInputCity(e.target.value)}
              className="p-2 rounded-lg text-gray-800 border-2 border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-150"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Go'}
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Current Location Display */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-extrabold text-gray-800">
            Real-Time Environmental Monitoring for <span className="text-emerald-600">{city}</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Data last updated: {data.aqi?.date ? new Date(data.aqi.date).toLocaleTimeString() : 'N/A'}
            {data.aqi?.source && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Live API Data
              </span>
            )}
          </p>
          {data.aqi?.coordinates && (
            <p className="text-xs text-gray-400 mt-1">
              Coordinates: {data.aqi.coordinates.lat.toFixed(4)}, {data.aqi.coordinates.lon.toFixed(4)}
            </p>
          )}
        </div>

        {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                Error: {error}
            </div>
        )}

        {/* Section 1: Core Monitoring Metrics (Objective 1) */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* AQI Card */}
          <DashboardCard
            icon={Cloud}
            title="Air Quality Index"
            value={data.aqi?.aqi || '--'}
            unit={data.aqi?.mainPollutant ? `(${data.aqi.mainPollutant})` : ''}
            status={data.aqi?.level || (data.aqi?.aqi ? getAqiStatus(data.aqi.aqi) : 'N/A')}
            colorClass={data.aqi?.aqi ? getAqiColor(data.aqi.aqi) : 'border-b-gray-400'}
          />
          
          {/* Carbon Emissions Card */}
          <DashboardCard
            icon={Zap}
            title="Carbon Emissions"
            value={data.carbon?.carbonEmission || '--'}
            unit={data.carbon?.unit ? data.carbon.unit.split(' ')[0] : 'tons'}
            status={data.carbon?.trend || 'N/A'}
            colorClass="border-b-orange-500"
          />

          {/* Water Usage/Stress Card */}
          <DashboardCard
            icon={Droplets}
            title="Water Stress Index"
            value={data.water?.waterStress || '--'}
            unit="/ 5.0"
            status={data.water?.level || 'N/A'}
            colorClass={data.water?.waterStress > 3.5 ? 'border-b-blue-600' : 'border-b-blue-400'}
          />

          {/* Forecast Card (Objective 2: Predictive Modeling) */}
          <DashboardCard
            icon={TrendingUp}
            title="7-Day AQI Forecast"
            value={data.forecast?.forecast?.[6]?.aqi || '--'}
            unit="AQI"
            status={data.forecast?.forecast?.[6]?.level || 'N/A'}
            colorClass={data.forecast?.forecast?.[6]?.level === 'Moderate' ? 'border-b-yellow-600' : 'border-b-gray-400'}
          />
        </section>


        {/* Section 2: Remote Sensing & Prediction Detail */}
        <section className="grid lg:grid-cols-3 gap-6 mb-12">
            
            {/* Pollution Forecast Detail */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Cloud className="w-5 h-5 mr-2 text-emerald-600" />
                    Pollution Prediction & Risk Analysis
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                    7-Day Weather-Based Forecast | Source: {data.forecast?.source || 'Loading...'}
                </p>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 font-medium">Average Predicted AQI: <span className="font-bold text-2xl text-emerald-600">{data.forecast?.forecast ? Math.round(data.forecast.forecast.reduce((sum, day) => sum + day.aqi, 0) / data.forecast.forecast.length) : '--'}</span></p>
                    <p className="text-gray-600 mt-2 text-sm">Forecast based on weather patterns and current air quality trends.</p>
                </div>

                {/* 7-Day Forecast Timeline */}
                {data.forecast?.forecast && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-gray-700 mb-2">7-Day AQI Forecast</h4>
                        <div className="space-y-2">
                            {data.forecast.forecast.map((day, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div className="text-sm">
                                        <span className="font-medium">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                        <span className="text-gray-500 ml-2">{day.weather}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-lg">{Math.round(day.aqi)}</span>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                            day.level === 'Good' ? 'bg-green-100 text-green-800' :
                                            day.level === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {day.level}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AQI Components Detail */}
                {data.aqi?.components && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Air Quality Components (μg/m³)</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                                <span>PM2.5:</span>
                                <span className="font-medium text-red-600">{data.aqi.components.pm2_5?.toFixed(1) || '--'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                                <span>PM10:</span>
                                <span className="font-medium text-orange-600">{data.aqi.components.pm10?.toFixed(1) || '--'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                                <span>NO2:</span>
                                <span className="font-medium text-yellow-600">{data.aqi.components.no2?.toFixed(1) || '--'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                                <span>O3:</span>
                                <span className="font-medium text-blue-600">{data.aqi.components.o3?.toFixed(1) || '--'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                                <span>CO:</span>
                                <span className="font-medium text-purple-600">{data.aqi.components.co?.toFixed(0) || '--'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                                <span>SO2:</span>
                                <span className="font-medium text-green-600">{data.aqi.components.so2?.toFixed(1) || '--'}</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Data source: {data.aqi.source || 'OpenWeatherMap Air Pollution API'}
                        </p>
                    </div>
                )}

                <div className="mt-4">
                    <h4 className="font-semibold text-gray-700">Carbon & Environmental Factors</h4>
                    {data.carbon?.factors && (
                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                                <span>Temperature:</span>
                                <span className="font-medium text-emerald-600">{data.carbon.factors.temperature}°C</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                                <span>Humidity:</span>
                                <span className="font-medium text-emerald-600">{data.carbon.factors.humidity}%</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                                <span>Wind Speed:</span>
                                <span className="font-medium text-emerald-600">{data.carbon.factors.windSpeed} m/s</span>
                            </div>
                        </div>
                    )}
                    {data.carbon?.recommendations && (
                        <div className="mt-3">
                            <h5 className="font-medium text-gray-700 text-sm">Carbon Reduction Tips:</h5>
                            <ul className="text-xs text-gray-600 mt-1 space-y-1">
                                {data.carbon.recommendations.slice(0, 3).map((tip, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-emerald-600 mr-1">•</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {/* Carbon Breakdown by Sector */}
                    {data.carbon?.breakdown && (
                        <div className="mt-4">
                            <h5 className="font-medium text-gray-700 text-sm mb-2">Carbon Emissions by Sector</h5>
                            <div className="space-y-2">
                                {data.carbon.breakdown.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <div className="flex items-center">
                                            <div 
                                                className="w-3 h-3 rounded-full mr-2"
                                                style={{
                                                    backgroundColor: [
                                                        '#ef4444', '#f97316', '#eab308', 
                                                        '#22c55e', '#3b82f6', '#8b5cf6'
                                                    ][index % 6]
                                                }}
                                            ></div>
                                            <span className="text-sm font-medium text-gray-700">{item.sector}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-gray-800">{item.percentage}%</div>
                                            <div className="text-xs text-gray-500">{item.emissions} tons</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Total: {data.carbon.carbonEmission} {data.carbon.unit?.split(' ')[0]} per capita
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* NDVI Remote Sensing (Objective 4) */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Trees className="w-5 h-5 mr-2 text-emerald-600" />
                    NDVI Vegetation Analysis
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                    Area: {data.ndvi?.areaId || 'N/A'} | City: {data.ndvi?.city || city}
                </p>
                
                {/* NDVI Visualization Placeholder */}
                <div className="w-full h-32 mt-4 rounded-lg bg-gradient-to-r from-red-200 via-yellow-200 via-green-200 to-green-600 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white bg-black bg-opacity-50 px-3 py-1 rounded">
                            NDVI: {data.ndvi?.ndvi || '--'}
                        </div>
                        <div className="text-sm text-white bg-black bg-opacity-50 px-2 py-1 rounded mt-1">
                            Satellite Imagery Simulation
                        </div>
                    </div>
                </div>
                
                <div className="mt-3 text-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-700">NDVI Score:</span>
                        <span className="text-emerald-600 font-bold">{data.ndvi?.ndvi || '--'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Vegetation Health:</span>
                        <span className="font-semibold text-green-700">{data.ndvi?.vegetationHealth || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Trend:</span>
                        <span className={`font-medium ${
                            data.ndvi?.trend === 'improving' ? 'text-green-600' :
                            data.ndvi?.trend === 'declining' ? 'text-red-600' :
                            'text-gray-600'
                        }`}>
                            {data.ndvi?.trend || 'N/A'}
                        </span>
                    </div>
                    {data.ndvi?.analysis && (
                        <>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Forest Cover:</span>
                                <span className="text-green-600">{data.ndvi.analysis.forestCover}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Urban Green:</span>
                                <span className="text-green-600">{data.ndvi.analysis.urbanGreenSpace}</span>
                            </div>
                        </>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                        Source: {data.ndvi?.source || 'NDVI Simulation'}
                    </p>
                </div>
            </div>
        </section>
        
        {/* Section 3: Personalized Recommendations (Objective 3) */}
        <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Leaf className="w-6 h-6 mr-2 text-emerald-600" />
                    Personalized Eco-Friendly Recommendations for {city}
                </h3>
                {data.recommendations?.analysis && (
                    <div className="text-sm text-gray-500 text-right">
                        <div>AQI: {data.recommendations.analysis.aqi} | Carbon: {data.recommendations.analysis.carbonEmission} tons</div>
                        <div>Temp: {data.recommendations.analysis.temperature}°C | {data.recommendations.analysis.conditions}</div>
                    </div>
                )}
            </div>
            
            {data.recommendations?.analysis && (
                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                    <h4 className="font-semibold text-gray-800 mb-2">🎯 Environmental Analysis for {city}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                            <div className="font-bold text-lg text-emerald-600">{data.recommendations.analysis.aqi}</div>
                            <div className="text-gray-600">Air Quality Index</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-lg text-orange-600">{data.recommendations.analysis.carbonEmission}</div>
                            <div className="text-gray-600">CO2 tons/capita</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-lg text-blue-600">{data.recommendations.analysis.temperature}°C</div>
                            <div className="text-gray-600">Temperature</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-lg text-purple-600">{data.recommendations.analysis.humidity}%</div>
                            <div className="text-gray-600">Humidity</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.recommendations && data.recommendations.recommendations && data.recommendations.recommendations.length > 0 ? (
                    data.recommendations.recommendations.map((rec, index) => (
                        <RecommendationCard 
                            key={index} 
                            title={rec.title} 
                            impact={rec.impact} 
                            detail={rec.detail}
                            category={rec.category}
                            priority={rec.priority}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-8">
                        <p className="text-gray-500">Loading personalized recommendations...</p>
                        <p className="text-sm text-gray-400 mt-1">Analyzing AQI, carbon emissions, and weather data for {city}</p>
                    </div>
                )}
            </div>
            
            {data.recommendations?.recommendations && data.recommendations.recommendations.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 text-center">
                        💡 Recommendations are personalized based on {city}'s current AQI ({data.recommendations.analysis?.aqi}), 
                        carbon emissions ({data.recommendations.analysis?.carbonEmission} tons/capita), 
                        and weather conditions. Updated every hour.
                    </p>
                </div>
            )}
        </section>

      </main>
    </div>
  );
};

export default App;