// API utils placeholder
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchSensors() {
  const res = await fetch(`${API_BASE}/sensors/`);
  return res.json();
}
