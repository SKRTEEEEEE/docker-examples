import { Request, Response } from 'express';
import SensorReading from '../models/SensorReading';

export const getSensorHistory = async (req: Request, res: Response) => {
  try {
    const { sensorId } = req.params;
    const { startDate, endDate, limit = 1000 } = req.query;

    const query: any = { sensorId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate as string);
      }
    }

    const readings = await SensorReading.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json(readings.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sensor history', error });
  }
};

export const getRecentHistory = async (req: Request, res: Response) => {
  try {
    const { sensorId } = req.params;
    const { hours = 24 } = req.query;

    const startDate = new Date();
    startDate.setHours(startDate.getHours() - Number(hours));

    const readings = await SensorReading.find({
      sensorId,
      timestamp: { $gte: startDate },
    }).sort({ timestamp: -1 });

    res.json(readings.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent history', error });
  }
};

export const getHistoryStats = async (req: Request, res: Response) => {
  try {
    const { sensorId } = req.params;
    const { startDate, endDate } = req.query;

    const query: any = { sensorId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate as string);
      }
    }

    const stats = await SensorReading.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$sensorId',
          count: { $sum: 1 },
          avgValue: { $avg: '$value' },
          minValue: { $min: '$value' },
          maxValue: { $max: '$value' },
          firstReading: { $min: '$timestamp' },
          lastReading: { $max: '$timestamp' },
        },
      },
    ]);

    if (stats.length === 0) {
      return res.json({
        count: 0,
        avgValue: 0,
        minValue: 0,
        maxValue: 0,
        firstReading: null,
        lastReading: null,
      });
    }

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history stats', error });
  }
};

export const deleteOldReadings = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(days));

    const result = await SensorReading.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    res.json({
      message: `Deleted readings older than ${days} days`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting old readings', error });
  }
};
