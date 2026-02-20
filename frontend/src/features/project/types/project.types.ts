import type { User } from '@/types/user.types';

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';

export interface ProjectOwner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  ownerId: string;
  owner: ProjectOwner;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  createdAt: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'role'>;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  status?: ProjectStatus;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface GetProjectsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}
