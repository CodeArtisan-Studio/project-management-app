import type { User } from '@/types/user.types';

export interface TaskStatus {
  id: string;
  projectId: string;
  name: string;
  color: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskAssignee = Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'role'>;

export interface Task {
  id: string;
  projectId: string;
  statusId: string;
  assigneeId: string | null;
  title: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  status: TaskStatus;
  assignee: TaskAssignee | null;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  statusId: string;
  assigneeId?: string;
  order?: number;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  statusId?: string;
  assigneeId?: string | null;
  order?: number;
}

export interface GetTasksQuery {
  page?: number;
  limit?: number;
  search?: string;
  statusId?: string;
  assigneeId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'order' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTaskStatusPayload {
  name: string;
  color?: string;
  order?: number;
}

export interface UpdateTaskStatusPayload {
  name?: string;
  color?: string | null;
  order?: number;
}

// ─── Kanban Board Types ──────────────────────────────────

export interface KanbanColumn {
  status: TaskStatus;
  tasks: Task[];
}

export interface KanbanDragResult {
  taskId: string;
  sourceStatusId: string;
  destinationStatusId: string;
  sourceIndex: number;
  destinationIndex: number;
}
