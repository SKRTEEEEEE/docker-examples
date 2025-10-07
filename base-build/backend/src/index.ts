import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { connectMQTT, disconnectMQTT } from './services/mqttService';
import sensorRoutes from './routes/sensor.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

connectDB();
connectMQTT();

app.use('/api/sensors', sensorRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sensor API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend...');
  disconnectMQTT();
  process.exit(0);
});
