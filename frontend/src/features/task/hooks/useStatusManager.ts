import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useTaskStatuses,
  useCreateTaskStatus,
  useUpdateTaskStatus,
  useDeleteTaskStatus,
} from './useTasks';
import { QUERY_KEYS } from '@/constants/query-keys';
import { getApiErrorMessage } from '@/lib/utils';
import type { DropResult } from '@hello-pangea/dnd';
import type { TaskStatus } from '@/features/task/types/task.types';

interface UseStatusManagerReturn {
  statuses: TaskStatus[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;

  // Create
  isCreating: boolean;
  createError: string | null;
  handleCreate: (name: string, color?: string) => Promise<void>;

  // Rename
  editingStatusId: string | null;
  setEditingStatusId: (id: string | null) => void;
  handleRename: (statusId: string, name: string) => Promise<void>;

  // Delete
  deletingStatusId: string | null;
  deleteError: string | null;
  handleDelete: (statusId: string) => void;

  // Reorder (drag-and-drop)
  onDragEnd: (result: DropResult) => void;
}

export function useStatusManager(projectId: string): UseStatusManagerReturn {
  const queryClient = useQueryClient();
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [deletingStatusId, setDeletingStatusId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: statuses,
    isLoading,
    isError,
    refetch,
  } = useTaskStatuses(projectId);

  const { mutateAsync: createStatus, isPending: isCreating } = useCreateTaskStatus(projectId);
  const { mutateAsync: updateStatus } = useUpdateTaskStatus(projectId);
  const { mutateAsync: deleteStatus } = useDeleteTaskStatus(projectId);

  const handleCreate = useCallback(
    async (name: string, color?: string) => {
      setCreateError(null);
      try {
        const nextOrder = statuses ? statuses.length : 0;
        await createStatus({
          name,
          order: nextOrder,
          ...(color && { color }),
        });
      } catch (error) {
        setCreateError(getApiErrorMessage(error, 'Failed to create status.'));
        throw error;
      }
    },
    [createStatus, statuses],
  );

  const handleRename = useCallback(
    async (statusId: string, name: string) => {
      try {
        await updateStatus({ statusId, payload: { name } });
        setEditingStatusId(null);
      } catch {
        // Error shown by server-side validation if name conflict
      }
    },
    [updateStatus],
  );

  const handleDelete = useCallback(
    (statusId: string) => {
      setDeletingStatusId(statusId);
      setDeleteError(null);
      deleteStatus(statusId)
        .catch((error) => {
          setDeleteError(getApiErrorMessage(error, 'Cannot delete a status that has tasks.'));
        })
        .finally(() => {
          setDeletingStatusId(null);
        });
    },
    [deleteStatus],
  );

  // ─── Optimistic Reorder via Drag-and-Drop ──────────────
  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination || !statuses) return;

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

      if (sourceIndex === destinationIndex) return;

      // Optimistic: reorder locally
      const queryKey = QUERY_KEYS.tasks.statuses(projectId);
      const previousStatuses = queryClient.getQueryData<TaskStatus[]>(queryKey);

      const reordered = [...statuses];
      const [moved] = reordered.splice(sourceIndex, 1);
      reordered.splice(destinationIndex, 0, moved);

      // Update order values for all statuses
      const withNewOrder = reordered.map((s, i) => ({ ...s, order: i }));
      queryClient.setQueryData(queryKey, withNewOrder);

      // Persist: update all statuses whose order changed
      const updates = withNewOrder
        .filter((s, i) => {
          const original = statuses.find((os) => os.id === s.id);
          return original && original.order !== i;
        })
        .map((s) =>
          updateStatus({ statusId: s.id, payload: { order: s.order } }),
        );

      Promise.all(updates)
        .catch(() => {
          // Rollback on failure
          if (previousStatuses) {
            queryClient.setQueryData(queryKey, previousStatuses);
          }
        })
        .finally(() => {
          void queryClient.invalidateQueries({ queryKey });
        });
    },
    [statuses, projectId, queryClient, updateStatus],
  );

  return {
    statuses: statuses ?? [],
    isLoading,
    isError,
    refetch,
    isCreating,
    createError,
    handleCreate,
    editingStatusId,
    setEditingStatusId,
    handleRename,
    deletingStatusId,
    deleteError,
    handleDelete,
    onDragEnd,
  };
}
