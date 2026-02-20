import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import type {
  CreateTaskPayload,
  CreateTaskStatusPayload,
  GetTasksQuery,
  UpdateTaskPayload,
  UpdateTaskStatusPayload,
} from '@/features/task/types/task.types';

// ─── Task Statuses ────────────────────────────────────────

export function useTaskStatuses(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.tasks.statuses(projectId),
    queryFn: () => taskService.getTaskStatuses(projectId),
    enabled: !!projectId,
  });
}

export function useCreateTaskStatus(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskStatusPayload) =>
      taskService.createTaskStatus(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.statuses(projectId),
      });
    },
  });
}

export function useUpdateTaskStatus(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ statusId, payload }: { statusId: string; payload: UpdateTaskStatusPayload }) =>
      taskService.updateTaskStatus(projectId, statusId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.statuses(projectId),
      });
    },
  });
}

export function useDeleteTaskStatus(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (statusId: string) => taskService.deleteTaskStatus(projectId, statusId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.statuses(projectId),
      });
    },
  });
}

// ─── Tasks ────────────────────────────────────────────────

export function useTasks(projectId: string, params?: GetTasksQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.tasks.list(projectId, params as Record<string, unknown>),
    queryFn: () => taskService.getTasks(projectId, params),
    enabled: !!projectId,
  });
}

export function useTask(projectId: string, taskId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.tasks.detail(projectId, taskId),
    queryFn: () => taskService.getTaskById(projectId, taskId),
    enabled: !!projectId && !!taskId,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.createTask(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.lists(projectId),
      });
    },
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }) =>
      taskService.updateTask(projectId, taskId, payload),
    onSuccess: (_data, { taskId }) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.detail(projectId, taskId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.lists(projectId),
      });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(projectId, taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.lists(projectId),
      });
    },
  });
}
