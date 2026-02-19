import { Role } from '@/generated/prisma/client';

// ─── Authenticated User Payload ─────────────────────────
// Represents the decoded JWT payload attached to every
// authenticated request after `requireAuth` middleware runs.
export interface AuthenticatedUser {
  userId: string;
  role: Role;
}

// ─── Express Request Augmentation ───────────────────────
// Globally extends Express.Request so req.user is available
// on all route handlers without manual casting.
// After `requireAuth` runs, req.user is guaranteed to be defined.
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// ─── Pagination ──────────────────────────────────────────
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ─── API Response ────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data?: T;
}
