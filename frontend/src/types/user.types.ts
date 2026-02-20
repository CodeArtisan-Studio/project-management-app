// ─── Mirrors backend SafeUser (password excluded) ────────

export type UserRole = 'ADMIN' | 'MAINTAINER' | 'MEMBER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
