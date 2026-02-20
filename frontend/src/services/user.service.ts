import { apiGet, apiPatch, apiDelete } from './api';
import type { PaginatedData } from '@/types/api.types';
import type { User } from '@/types/user.types';

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'firstName' | 'lastName' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const userService = {
  getMe(): Promise<User> {
    return apiGet<User>('/users/me');
  },

  updateMe(payload: UpdateProfilePayload): Promise<User> {
    return apiPatch<User>('/users/me', payload);
  },

  /** Admin-only: list all users with pagination. */
  getUsers(params?: GetUsersQuery): Promise<PaginatedData<User>> {
    return apiGet<PaginatedData<User>>('/users', { params });
  },

  /** Admin-only: soft-delete a user by id. */
  deleteUser(userId: string): Promise<void> {
    return apiDelete(`/users/${userId}`);
  },
};
