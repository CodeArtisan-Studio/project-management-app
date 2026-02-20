import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth.middleware';
import { validate } from '@/utils/validate';
import { activityController } from './activity.controller';
import { GetActivitiesQuerySchema } from './activity.dto';

// Mounted at /api/projects/:id/activities
// mergeParams: true exposes the parent :id param as req.params.id
const activityRouter = Router({ mergeParams: true });

activityRouter.get(
  '/',
  requireAuth,
  validate(GetActivitiesQuerySchema, 'query'),
  activityController.getProjectActivities,
);

export { activityRouter as activityRoutes };
