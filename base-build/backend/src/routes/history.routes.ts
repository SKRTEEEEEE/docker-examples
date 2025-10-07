import { Router } from 'express';
import {
  getSensorHistory,
  getRecentHistory,
  getHistoryStats,
  deleteOldReadings,
} from '../controllers/history.controller';

const router = Router();

router.get('/:sensorId', getSensorHistory);
router.get('/:sensorId/recent', getRecentHistory);
router.get('/:sensorId/stats', getHistoryStats);
router.delete('/cleanup', deleteOldReadings);

export default router;
