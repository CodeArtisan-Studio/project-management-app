import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth.middleware';
import { validate } from '@/utils/validate';
import { reportController } from './report.controller';
import {
  SummaryQuerySchema,
  TasksByProjectQuerySchema,
  TasksByAssigneeQuerySchema,
  ActivityOverTimeQuerySchema,
  CompletionRateQuerySchema,
} from './report.dto';

const router = Router();

router.get(
  '/summary',
  requireAuth,
  validate(SummaryQuerySchema, 'query'),
  reportController.getSummary,
);

router.get(
  '/tasks-by-project',
  requireAuth,
  validate(TasksByProjectQuerySchema, 'query'),
  reportController.getTasksByProject,
);

router.get(
  '/tasks-by-assignee',
  requireAuth,
  validate(TasksByAssigneeQuerySchema, 'query'),
  reportController.getTasksByAssignee,
);

router.get(
  '/activity-over-time',
  requireAuth,
  validate(ActivityOverTimeQuerySchema, 'query'),
  reportController.getActivityOverTime,
);

router.get(
  '/completion-rate',
  requireAuth,
  validate(CompletionRateQuerySchema, 'query'),
  reportController.getCompletionRate,
);

export { router as reportRoutes };
