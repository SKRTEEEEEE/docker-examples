import { Request, Response } from 'express';
import { sensorEvents } from '../services/eventEmitter';
import Sensor from '../models/Sensor';

export const streamSensorUpdates = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.write('data: {"type": "connected"}\n\n');

  try {
    const sensors = await Sensor.find().sort({ createdAt: -1 });
    res.write(`data: ${JSON.stringify({ type: 'initial', sensors })}\n\n`);
  } catch (error) {
    console.error('Error fetching initial sensors:', error);
  }

  const updateHandler = async (data: any) => {
    try {
      const sensor = await Sensor.findById(data.sensorId);
      if (sensor) {
        res.write(`data: ${JSON.stringify({ type: 'update', sensor })}\n\n`);
      }
    } catch (error) {
      console.error('Error in SSE update handler:', error);
    }
  };

  sensorEvents.onSensorUpdate(updateHandler);

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sensorEvents.removeSensorUpdateListener(updateHandler);
    console.log('SSE client disconnected');
  });
};
