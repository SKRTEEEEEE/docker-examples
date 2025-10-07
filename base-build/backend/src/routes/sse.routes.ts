import { Router } from 'express';
import { streamSensorUpdates } from '../controllers/sse.controller';

const router = Router();

router.get('/sensors', streamSensorUpdates);

export default router;
