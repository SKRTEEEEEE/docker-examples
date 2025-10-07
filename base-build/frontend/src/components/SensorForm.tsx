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
    unit: '°C',
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
      unit: '°C',
      status: 'active',
    });
  };

  const handleTypeChange = (type: string) => {
    let unit = '';
    switch (type) {
      case 'temperature':
        unit = '°C';
        break;
      case 'humidity':
        unit = '%';
        break;
      case 'pressure':
        unit = 'hPa';
        break;
      case 'light':
        unit = 'lux';
        break;
      case 'motion':
        unit = 'detected';
        break;
      default:
        unit = '';
    }
    setFormData({ ...formData, type, unit });
  };

  return (
    <form className="add-sensor-form" onSubmit={handleSubmit}>
      <h2>Add New Sensor</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Sensor Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Type *</label>
          <select
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value)}
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
            required
          />
        </div>

        <div className="form-group">
          <label>Value *</label>
          <input
            type="number"
            step="0.01"
            value={formData.value}
            onChange={(e) =>
              setFormData({ ...formData, value: parseFloat(e.target.value) })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Unit *</label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
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
        Add Sensor
      </button>
    </form>
  );
}
