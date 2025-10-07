import { Sensor, CreateSensorDto } from '@/services/sensorService';
import { useState } from 'react';

interface SensorCardProps {
  sensor: Sensor;
  onUpdate: (id: string, data: Partial<CreateSensorDto>) => void;
  onDelete: (id: string) => void;
}

export default function SensorCard({ sensor, onUpdate, onDelete }: SensorCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: sensor.name,
    location: sensor.location,
    status: sensor.status,
  });

  const handleUpdate = () => {
    onUpdate(sensor._id, editData);
    setIsEditing(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="sensor-card">
      <div className="sensor-header">
        <h3 className="sensor-name">{sensor.name}</h3>
        <span className={`sensor-status status-${sensor.status}`}>
          {sensor.status}
        </span>
      </div>

      <div className="sensor-info">
        <div className="sensor-info-row">
          <span className="info-label">Type:</span>
          <span className="info-value">{sensor.type}</span>
        </div>
        <div className="sensor-info-row">
          <span className="info-label">Location:</span>
          <span className="info-value">{sensor.location}</span>
        </div>
        <div className="sensor-info-row">
          <span className="info-label">Last Updated:</span>
          <span className="info-value">{formatDate(sensor.lastUpdated)}</span>
        </div>
      </div>

      <div className="sensor-value">
        {sensor.value} {sensor.unit}
        <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '5px' }}>
          📡 Updated via MQTT
        </div>
      </div>

      {isEditing && (
        <div style={{ marginBottom: '15px' }}>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label>Sensor Name:</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
            />
          </div>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label>Location:</label>
            <input
              type="text"
              value={editData.location}
              onChange={(e) =>
                setEditData({ ...editData, location: e.target.value })
              }
            />
          </div>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label>Status:</label>
            <select
              value={editData.status}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  status: e.target.value as 'active' | 'inactive' | 'maintenance',
                })
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      )}

      <div className="sensor-actions">
        {isEditing ? (
          <>
            <button className="btn btn-update" onClick={handleUpdate}>
              Save
            </button>
            <button
              className="btn btn-delete"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-update" onClick={() => setIsEditing(true)}>
              Update
            </button>
            <button
              className="btn btn-delete"
              onClick={() => onDelete(sensor._id)}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
