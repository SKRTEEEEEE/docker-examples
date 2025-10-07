import { Router } from 'express';
import {
  getAllSensors,
  getSensorById,
  createSensor,
  updateSensor,
  deleteSensor,
} from '../controllers/sensor.controller';

const router = Router();

router.get('/', getAllSensors);
router.get('/:id', getSensorById);
router.post('/', createSensor);
router.put('/:id', updateSensor);
router.delete('/:id', deleteSensor);

export default router;
