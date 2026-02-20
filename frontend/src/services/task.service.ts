import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { PaginatedData } from '@/types/api.types';
import type {
  Task,
  TaskStatus,
  CreateTaskPayload,
  UpdateTaskPayload,
  GetTasksQuery,
  CreateTaskStatusPayload,
  UpdateTaskStatusPayload,
} from '@/features/task/types/task.types';

export const taskService = {
  // ─── Task Statuses ────────────────────────────────────
  getTaskStatuses(projectId: string): Promise<TaskStatus[]> {
    return apiGet<TaskStatus[]>(`/projects/${projectId}/statuses`);
  },

  createTaskStatus(
    projectId: string,
    payload: CreateTaskStatusPayload,
  ): Promise<TaskStatus> {
    return apiPost<TaskStatus>(`/projects/${projectId}/statuses`, payload);
  },

  updateTaskStatus(
    projectId: string,
    statusId: string,
    payload: UpdateTaskStatusPayload,
  ): Promise<TaskStatus> {
    return apiPatch<TaskStatus>(`/projects/${projectId}/statuses/${statusId}`, payload);
  },

  deleteTaskStatus(projectId: string, statusId: string): Promise<void> {
    return apiDelete(`/projects/${projectId}/statuses/${statusId}`);
  },

  // ─── Tasks ────────────────────────────────────────────
  getTasks(projectId: string, params?: GetTasksQuery): Promise<PaginatedData<Task>> {
    return apiGet<PaginatedData<Task>>(`/projects/${projectId}/tasks`, { params });
  },

  getTaskById(projectId: string, taskId: string): Promise<Task> {
    return apiGet<Task>(`/projects/${projectId}/tasks/${taskId}`);
  },

  createTask(projectId: string, payload: CreateTaskPayload): Promise<Task> {
    return apiPost<Task>(`/projects/${projectId}/tasks`, payload);
  },

  updateTask(
    projectId: string,
    taskId: string,
    payload: UpdateTaskPayload,
  ): Promise<Task> {
    return apiPatch<Task>(`/projects/${projectId}/tasks/${taskId}`, payload);
  },

  deleteTask(projectId: string, taskId: string): Promise<void> {
    return apiDelete(`/projects/${projectId}/tasks/${taskId}`);
  },
};
