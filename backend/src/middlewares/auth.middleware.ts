import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@/generated/prisma/client';
import { env } from '@/config/env';
import { AppError } from '@/utils/appError';

// ─── JWT Payload Shape ───────────────────────────────────
interface JwtPayload {
  userId: string;
  role: Role;
}

// ─── requireAuth ─────────────────────────────────────────
// Validates the Bearer token from the Authorization header.
// On success, attaches { userId, role } to req.user so all
// downstream handlers can safely access req.user!.
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Missing or invalid authorization token.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired token.'));
  }
}

// ─── requireRole ─────────────────────────────────────────
// Role-based authorization guard. Must be composed after requireAuth.
// Accepts one or more Role enum values.
// Usage: requireRole(Role.ADMIN) | requireRole(Role.ADMIN, Role.MEMBER)
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        AppError.forbidden('You do not have permission to perform this action.'),
      );
    }
    next();
  };
}
