import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth.middleware';
import { dashboardController } from './dashboard.controller';

const router = Router();

router.get('/stats', requireAuth, dashboardController.getStats);

export { router as dashboardRoutes };
