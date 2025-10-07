import { useState } from 'react';
import { CreateSensorDto } from '@/services/sensorService';

interface SensorFormProps {
  onSubmit: (sensor: CreateSensorDto) => void;
}

export default function SensorForm({ onSubmit }: SensorFormProps) {
  const [formData, setFormData] = useState<CreateSensorDto>({
    name: '',
    type: 'temperature',
    location: '',
    value: 0,
    unit: '',
    status: 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      type: 'temperature',
      location: '',
      value: 0,
      unit: '',
      status: 'active',
    });
  };

  return (
    <form className="add-sensor-form" onSubmit={handleSubmit}>
      <h2>Register New Sensor</h2>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.95rem' }}>
        📡 Sensor values will be automatically updated via MQTT from Raspberry Pi devices
      </p>
      <div className="form-grid">
        <div className="form-group">
          <label>Sensor Name * (must match Pi device ID)</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., temp-sensor-01"
            required
          />
        </div>

        <div className="form-group">
          <label>Type *</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          >
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="pressure">Pressure</option>
            <option value="motion">Motion</option>
            <option value="light">Light</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Location *</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="e.g., Living Room"
            required
          />
        </div>

        <div className="form-group">
          <label>Status *</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as 'active' | 'inactive' | 'maintenance',
              })
            }
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        Register Sensor
      </button>
    </form>
  );
}
