'use client';

import { useState, useEffect } from 'react';
import { sensorService, Sensor, CreateSensorDto } from '@/services/sensorService';
import SensorCard from '@/components/SensorCard';
import SensorForm from '@/components/SensorForm';
import SensorHistoryModal from '@/components/SensorHistoryModal';

export default function Home() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const eventSource = new EventSource(`${API_URL}/api/stream/sensors`);

    eventSource.onopen = () => {
      console.log('✅ SSE connection established');
      setError('');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          console.log('📡 Connected to sensor stream');
        } else if (data.type === 'initial') {
          setSensors(data.sensors);
          setLoading(false);
        } else if (data.type === 'update') {
          setSensors(prev => {
            const index = prev.findIndex(s => s._id === data.sensor._id);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = data.sensor;
              return updated;
            } else {
              return [...prev, data.sensor];
            }
          });
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('❌ SSE connection error:', err);
      setError('Lost connection to server. Reconnecting...');
      setLoading(false);
    };

    return () => {
      console.log('🛑 Closing SSE connection');
      eventSource.close();
    };
  }, []);

  const handleAddSensor = async (sensorData: CreateSensorDto) => {
    try {
      const newSensor = await sensorService.create(sensorData);
      setSensors(prev => [newSensor, ...prev]);
      setError('');
    } catch (err) {
      setError('Failed to create sensor');
      console.error(err);
    }
  };

  const handleUpdateSensor = async (id: string, sensorData: Partial<CreateSensorDto>) => {
    try {
      const updatedSensor = await sensorService.update(id, sensorData);
      setSensors(prev => prev.map(s => s._id === id ? updatedSensor : s));
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
        setSensors(prev => prev.filter(s => s._id !== id));
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
              onViewHistory={setSelectedSensor}
            />
          ))}
        </div>
      )}

      {selectedSensor && (
        <SensorHistoryModal
          sensor={selectedSensor}
          onClose={() => setSelectedSensor(null)}
        />
      )}
    </div>
  );
}
