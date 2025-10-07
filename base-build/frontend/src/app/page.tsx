'use client';

import { useState, useEffect } from 'react';
import { sensorService, Sensor, CreateSensorDto } from '@/services/sensorService';
import SensorCard from '@/components/SensorCard';
import SensorForm from '@/components/SensorForm';

export default function Home() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSensors = async () => {
    try {
      setLoading(true);
      const data = await sensorService.getAll();
      setSensors(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch sensors. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
  }, []);

  const handleAddSensor = async (sensorData: CreateSensorDto) => {
    try {
      await sensorService.create(sensorData);
      await fetchSensors();
      setError('');
    } catch (err) {
      setError('Failed to create sensor');
      console.error(err);
    }
  };

  const handleUpdateSensor = async (id: string, sensorData: Partial<CreateSensorDto>) => {
    try {
      await sensorService.update(id, sensorData);
      await fetchSensors();
      setError('');
    } catch (err) {
      setError('Failed to update sensor');
      console.error(err);
    }
  };

  const handleDeleteSensor = async (id: string) => {
    if (confirm('Are you sure you want to delete this sensor?')) {
      try {
        await sensorService.delete(id);
        await fetchSensors();
        setError('');
      } catch (err) {
        setError('Failed to delete sensor');
        console.error(err);
      }
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🎛️ Sensor Management System</h1>
        <p>Monitor and manage all your sensors in real-time</p>
      </header>

      {error && <div className="error">{error}</div>}

      <SensorForm onSubmit={handleAddSensor} />

      {loading ? (
        <div className="loading">Loading sensors...</div>
      ) : sensors.length === 0 ? (
        <div className="no-sensors">
          No sensors found. Add your first sensor above!
        </div>
      ) : (
        <div className="sensors-grid">
          {sensors.map((sensor) => (
            <SensorCard
              key={sensor._id}
              sensor={sensor}
              onUpdate={handleUpdateSensor}
              onDelete={handleDeleteSensor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
