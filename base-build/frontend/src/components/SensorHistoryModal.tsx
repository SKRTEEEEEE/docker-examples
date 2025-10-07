'use client';

import { useState, useEffect } from 'react';
import { Sensor } from '@/services/sensorService';
import { historyService, SensorReading, HistoryStats } from '@/services/historyService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SensorHistoryModalProps {
  sensor: Sensor;
  onClose: () => void;
}

export default function SensorHistoryModal({ sensor, onClose }: SensorHistoryModalProps) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      let hours = 24;

      switch (timeRange) {
        case '1h':
          hours = 1;
          break;
        case '6h':
          hours = 6;
          break;
        case '24h':
          hours = 24;
          break;
        case '7d':
          hours = 168;
          break;
        case '30d':
          hours = 720;
          break;
      }

      const [historyData, statsData] = await Promise.all([
        historyService.getRecentHistory(sensor._id, hours),
        historyService.getHistoryStats(sensor._id),
      ]);

      setReadings(historyData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const chartData = readings.map((reading) => ({
    time: formatTime(reading.timestamp),
    value: reading.value,
    fullDate: reading.timestamp,
  }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{sensor.name}</h2>
            <p className="modal-subtitle">
              {sensor.type} • {sensor.location}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="time-range-selector">
          {['1h', '6h', '24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="modal-loading">Loading history...</div>
        ) : (
          <>
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Average</div>
                  <div className="stat-value">
                    {stats.avgValue.toFixed(2)} {sensor.unit}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Minimum</div>
                  <div className="stat-value">
                    {stats.minValue.toFixed(2)} {sensor.unit}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Maximum</div>
                  <div className="stat-value">
                    {stats.maxValue.toFixed(2)} {sensor.unit}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Readings</div>
                  <div className="stat-value">{stats.count}</div>
                </div>
              </div>
            )}

            {readings.length === 0 ? (
              <div className="no-data">
                No historical data available for this time range
              </div>
            ) : (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="time"
                      stroke="#666"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke="#666"
                      style={{ fontSize: '12px' }}
                      label={{
                        value: sensor.unit,
                        angle: -90,
                        position: 'insideLeft',
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                      }}
                      formatter={(value: number) => [
                        `${value.toFixed(2)} ${sensor.unit}`,
                        'Value',
                      ]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          return formatDate(payload[0].payload.fullDate);
                        }
                        return label;
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#667eea"
                      strokeWidth={2}
                      dot={{ fill: '#667eea', r: 3 }}
                      activeDot={{ r: 5 }}
                      name={sensor.name}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
