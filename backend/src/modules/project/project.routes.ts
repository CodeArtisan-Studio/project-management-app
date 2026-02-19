import { Router } from 'express';
import { Role } from '@/generated/prisma/client';
import { requireAuth, requireRole } from '@/middlewares/auth.middleware';
import { validate } from '@/utils/validate';
import { projectController } from './project.controller';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  GetProjectsQuerySchema,
  AddMemberSchema,
} from './project.dto';
import { taskRoutes, taskStatusRoutes } from '@/modules/task/task.routes';

const router = Router();

// ─── Project CRUD ─────────────────────────────────────────

// Only MAINTAINER and ADMIN can create projects (become owners).
router.post(
  '/',
  requireAuth,
  requireRole(Role.MAINTAINER, Role.ADMIN),
  validate(CreateProjectSchema),
  projectController.createProject,
);

// All authenticated users can list projects.
// Scoping (owned vs. member vs. all) is enforced in the service layer.
router.get(
  '/',
  requireAuth,
  validate(GetProjectsQuerySchema, 'query'),
  projectController.getAllProjects,
);

router.get('/:id', requireAuth, projectController.getProjectById);

router.patch(
  '/:id',
  requireAuth,
  validate(UpdateProjectSchema),
  projectController.updateProject,
);

router.delete('/:id', requireAuth, projectController.deleteProject);

// ─── Member Management ────────────────────────────────────
// Add/remove restricted to project owner (MAINTAINER) or ADMIN — enforced in service.
// View accessible to owner, ADMIN, and any project member — enforced in service.

router.get('/:id/members', requireAuth, projectController.getProjectMembers);

router.post(
  '/:id/members',
  requireAuth,
  validate(AddMemberSchema),
  projectController.addProjectMember,
);

router.delete('/:id/members/:userId', requireAuth, projectController.removeProjectMember);

// ─── Task Sub-Routers ──────────────────────────────────
router.use('/:id/tasks', taskRoutes);
router.use('/:id/statuses', taskStatusRoutes);

export { router as projectRoutes };
