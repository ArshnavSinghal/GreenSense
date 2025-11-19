// Dashboard page placeholder
import React from 'react';
import SensorCard from '../components/SensorCard';

export default function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <SensorCard sensor={{ name: 'Example', value: 42 }} />
    </div>
  );
}
