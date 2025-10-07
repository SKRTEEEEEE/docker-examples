import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface SensorReading {
  _id: string;
  sensorId: string;
  sensorName: string;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface HistoryStats {
  count: number;
  avgValue: number;
  minValue: number;
  maxValue: number;
  firstReading: string | null;
  lastReading: string | null;
}

const api = axios.create({
  baseURL: `${API_URL}/api/history`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const historyService = {
  async getSensorHistory(
    sensorId: string,
    startDate?: string,
    endDate?: string,
    limit?: number
  ): Promise<SensorReading[]> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (limit) params.limit = limit;

    const response = await api.get(`/${sensorId}`, { params });
    return response.data;
  },

  async getRecentHistory(sensorId: string, hours: number = 24): Promise<SensorReading[]> {
    const response = await api.get(`/${sensorId}/recent`, { params: { hours } });
    return response.data;
  },

  async getHistoryStats(
    sensorId: string,
    startDate?: string,
    endDate?: string
  ): Promise<HistoryStats> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get(`/${sensorId}/stats`, { params });
    return response.data;
  },
};
