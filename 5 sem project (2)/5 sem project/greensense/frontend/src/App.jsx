import React, { useState, useEffect, useCallback } from 'react';
// The error was caused by this import: lucide-react was not installed.
import { Leaf, Cloud, Trees, Droplets, Zap, TrendingUp, Sun, Moon } from 'lucide-react'; 

// NOTE: Ensure your backend is running on http://localhost:3000 before testing.
const API_BASE_URL = 'http://localhost:3000/api';
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
const RecommendationCard = ({ title, impact, detail }) => {
  let impactColor = 'bg-yellow-500';
  if (impact === 'High') impactColor = 'bg-red-500';
  if (impact === 'Medium') impactColor = 'bg-orange-500';

  return (
    <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${impactColor}`}>
          {impact} Impact
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-2">{detail}</p>
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
      const response = await fetch(`${API_BASE_URL}/${path}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} for ${path}`);
      }
      return await response.json();
    } catch (e) {
      console.error(`Failed to fetch ${path}:`, e.message);
      return null;
    }
  }, []);

  // Main data fetching logic
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      
      const cityParam = encodeURIComponent(city);
      const areaParam = 'Amazon-Basin-01'; // Mock Area ID for NDVI

      // Fetch all required data points concurrently
      const [aqi, carbon, water, ndvi, forecast, recommendationsResponse] = await Promise.all([
        fetchEndpoint(`aqi/${cityParam}`),
        fetchEndpoint(`carbon/${cityParam}`),
        fetchEndpoint(`water/${cityParam}`),
        fetchEndpoint(`ndvi/${areaParam}`),
        fetchEndpoint(`forecast/pollution/${cityParam}`),
        fetchEndpoint('recommendations?risk=0.8'), // Hardcoded risk for mock, use actual user profile data later
      ]);
      
      if (!aqi || !carbon || !forecast) {
          // If core data is missing, throw an error, but allow the dashboard to partially load.
          console.error(`Missing core data: AQI=${!!aqi}, Carbon=${!!carbon}, Forecast=${!!forecast}`);
          // setError(`Could not retrieve core environmental data for ${city}. Check backend connection.`);
      }

      setData({
        aqi,
        carbon,
        water,
        ndvi,
        forecast,
        recommendations: recommendationsResponse?.recommendations || [],
      });
      setLoading(false);
    };

    loadAllData();
  }, [city, fetchEndpoint]);

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
          </p>
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
            status={data.aqi?.aqi ? getAqiStatus(data.aqi.aqi) : 'N/A'}
            colorClass={data.aqi?.aqi ? getAqiColor(data.aqi.aqi) : 'border-b-gray-400'}
          />
          
          {/* Carbon Emissions Card */}
          <DashboardCard
            icon={Zap}
            title="Carbon Emissions"
            value={data.carbon?.totalAnnualEmissions ? (data.carbon.totalAnnualEmissions / 1000000).toFixed(2) : '--'}
            unit="M Tonnes"
            status="High"
            colorClass="border-b-orange-500"
          />

          {/* Water Usage/Stress Card */}
          <DashboardCard
            icon={Droplets}
            title="Water Stress Index"
            value={data.water?.stressIndex || '--'}
            unit="/ 5.0"
            status={data.water?.stressIndex > 3.5 ? 'Critical' : 'Stable'}
            colorClass={data.water?.stressIndex > 3.5 ? 'border-b-blue-600' : 'border-b-blue-400'}
          />

          {/* Forecast Card (Objective 2: Predictive Modeling) */}
          <DashboardCard
            icon={TrendingUp}
            title="7-Day AQI Forecast"
            value={data.forecast?.aqiPrediction || '--'}
            unit="AQI"
            status={data.forecast?.risk || 'N/A'}
            colorClass={data.forecast?.risk === 'Medium' ? 'border-b-yellow-600' : 'border-b-gray-400'}
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
                    Model: {data.forecast?.model || 'Loading...'} | Forecast for: {data.forecast?.forecastDate || 'N/A'}
                </p>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 font-medium">Predicted AQI: <span className="font-bold text-2xl text-emerald-600">{data.forecast?.aqiPrediction}</span></p>
                    <p className="text-gray-600 mt-2 text-sm">{data.forecast?.notes || 'No notes available.'}</p>
                </div>

                <div className="mt-4">
                    <h4 className="font-semibold text-gray-700">Carbon Breakdown</h4>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        {data.carbon?.industryBreakdown.map((item, index) => (
                            <li key={index} className="flex justify-between items-center border-b border-gray-100 pb-1">
                                <span>{item.sector}:</span>
                                <span className="font-medium text-emerald-600">{item.percentage}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* NDVI Remote Sensing (Objective 4) */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Trees className="w-5 h-5 mr-2 text-emerald-600" />
                    NDVI Vegetation Analysis
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                    Area: {data.ndvi?.areaId || 'N/A'}
                </p>
                <img 
                    src={data.ndvi?.imageUrl} 
                    alt="NDVI Satellite Imagery Mock" 
                    className="w-full h-auto mt-4 rounded-lg object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/CCCCCC/333333?text=NDVI+Image+Unavailable" }}
                />
                <div className="mt-3 text-sm">
                    <p className="font-medium text-gray-700">NDVI Score: <span className="text-emerald-600 font-bold">{data.ndvi?.ndvi || '--'}</span></p>
                    <p className="font-medium text-gray-700">Status: <span className="font-semibold text-green-700">{data.ndvi?.status || 'N/A'}</span></p>
                    <p className="text-gray-600">Change (YoY): {data.ndvi?.vegetationChange || 'N/A'}</p>
                </div>
            </div>
        </section>
        
        {/* Section 3: Personalized Recommendations (Objective 3) */}
        <section className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-4 p-2">
                <Leaf className="w-6 h-6 mr-2 text-emerald-600" />
                Personalized Eco-Friendly Recommendations
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.recommendations.length > 0 ? (
                    data.recommendations.map(rec => (
                        <RecommendationCard 
                            key={rec.id} 
                            title={rec.title} 
                            impact={rec.impact} 
                            detail={rec.detail} 
                        />
                    ))
                ) : (
                    <p className="text-gray-500">No specific recommendations at this time. Keep up the good work!</p>
                )}
            </div>
        </section>

      </main>
    </div>
  );
};

export default App;