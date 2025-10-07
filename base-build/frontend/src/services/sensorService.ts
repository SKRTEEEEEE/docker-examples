import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Sensor {
  _id: string;
  name: string;
  type: string;
  location: string;
  value: number;
  unit: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSensorDto {
  name: string;
  type: string;
  location: string;
  value: number;
  unit: string;
  status: 'active' | 'inactive' | 'maintenance';
}

const api = axios.create({
  baseURL: `${API_URL}/api/sensors`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sensorService = {
  async getAll(): Promise<Sensor[]> {
    const response = await api.get('/');
    return response.data;
  },

  async getById(id: string): Promise<Sensor> {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  async create(sensor: CreateSensorDto): Promise<Sensor> {
    const response = await api.post('/', sensor);
    return response.data;
  },

  async update(id: string, sensor: Partial<CreateSensorDto>): Promise<Sensor> {
    const response = await api.put(`/${id}`, sensor);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/${id}`);
  },
};
