import { Router } from 'express';
import { Role } from '@/generated/prisma/client';
import { requireAuth, requireRole } from '@/middlewares/auth.middleware';
import { validate } from '@/utils/validate';
import { userController } from './user.controller';
import { UpdateProfileSchema, GetUsersQuerySchema } from './user.dto';

const router = Router();

// ─── Self-service (any authenticated user) ───────────────
router.get('/me', requireAuth, userController.getMe);

router.patch(
  '/me',
  requireAuth,
  validate(UpdateProfileSchema),
  userController.updateMe,
);

// ─── Admin only ──────────────────────────────────────────
router.get(
  '/',
  requireAuth,
  requireRole(Role.ADMIN),
  validate(GetUsersQuerySchema, 'query'),
  userController.getAllUsers,
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  userController.deleteUser,
);

export { router as userRoutes };
