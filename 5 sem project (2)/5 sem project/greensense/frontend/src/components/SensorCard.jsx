// SensorCard placeholder
import React from 'react';

export default function SensorCard({ sensor }) {
  return (
    <div className="sensor-card">
      <h3>{sensor?.name || 'Sensor'}</h3>
      <p>Value: {sensor?.value ?? '-'}</p>
    </div>
  );
}
