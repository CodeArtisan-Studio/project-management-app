import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth.middleware';
import { validate } from '@/utils/validate';
import { taskController } from './task.controller';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  GetTasksQuerySchema,
  CreateTaskStatusSchema,
  UpdateTaskStatusSchema,
} from './task.dto';

// ─── Task Status Router ───────────────────────────────────
// Mounted at /api/projects/:id/statuses
// mergeParams: true exposes the parent :id param as req.params.id
const statusRouter = Router({ mergeParams: true });

statusRouter.get('/', requireAuth, taskController.getTaskStatuses);

statusRouter.post(
  '/',
  requireAuth,
  validate(CreateTaskStatusSchema),
  taskController.createTaskStatus,
);

statusRouter.patch(
  '/:statusId',
  requireAuth,
  validate(UpdateTaskStatusSchema),
  taskController.updateTaskStatus,
);

statusRouter.delete('/:statusId', requireAuth, taskController.deleteTaskStatus);

// ─── Task Router ──────────────────────────────────────────
// Mounted at /api/projects/:id/tasks
// mergeParams: true exposes the parent :id param as req.params.id
const taskRouter = Router({ mergeParams: true });

taskRouter.get(
  '/',
  requireAuth,
  validate(GetTasksQuerySchema, 'query'),
  taskController.getTasksByProject,
);

taskRouter.post('/', requireAuth, validate(CreateTaskSchema), taskController.createTask);

taskRouter.get('/:taskId', requireAuth, taskController.getTaskById);

taskRouter.patch(
  '/:taskId',
  requireAuth,
  validate(UpdateTaskSchema),
  taskController.updateTask,
);

taskRouter.delete('/:taskId', requireAuth, taskController.deleteTask);

export { taskRouter as taskRoutes, statusRouter as taskStatusRoutes };
