// API configuration and utilities
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Centralized API service
class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} for ${endpoint}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error.message);
      throw error;
    }
  }

  // Environmental data endpoints
  async getAQI(city) {
    return this.request(`aqi/${encodeURIComponent(city)}`);
  }

  async getCarbonEmissions(city) {
    return this.request(`carbon/${encodeURIComponent(city)}`);
  }

  async getWaterStress(city) {
    return this.request(`water/${encodeURIComponent(city)}`);
  }

  async getNDVI(areaId, city = null) {
    const endpoint = city 
      ? `ndvi/${encodeURIComponent(areaId)}?city=${encodeURIComponent(city)}`
      : `ndvi/${encodeURIComponent(areaId)}`;
    return this.request(endpoint);
  }

  async getPollutionForecast(city) {
    return this.request(`forecast/pollution/${encodeURIComponent(city)}`);
  }

  async getRecommendations(city, riskLevel = 0.8) {
    return this.request(`recommendations?city=${encodeURIComponent(city)}&risk=${riskLevel}`);
  }

  async getStatus() {
    return this.request('status');
  }

  // Batch operations
  async getBatchNDVI(areaIds) {
    return this.request('ndvi/batch', {
      method: 'POST',
      body: JSON.stringify({ areaIds }),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Legacy function for backward compatibility
export async function fetchSensors() {
  const res = await fetch(`${API_BASE}/sensors/`);
  return res.json();
}
