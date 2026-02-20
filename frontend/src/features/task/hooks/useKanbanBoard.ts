import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTasks, useTaskStatuses, useUpdateTask } from './useTasks';
import { QUERY_KEYS } from '@/constants/query-keys';
import type { DropResult } from '@hello-pangea/dnd';
import type {
  Task,
  KanbanColumn,
  KanbanDragResult,
} from '@/features/task/types/task.types';
import type { PaginatedData } from '@/types/api.types';

interface UseKanbanBoardReturn {
  columns: KanbanColumn[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  onDragEnd: (result: DropResult) => void;
}

export function useKanbanBoard(projectId: string): UseKanbanBoardReturn {
  const queryClient = useQueryClient();

  const {
    data: tasksData,
    isLoading: tasksLoading,
    isError: tasksError,
    refetch: refetchTasks,
  } = useTasks(projectId, {
    page: 1,
    limit: 100,
    sortBy: 'order',
    sortOrder: 'asc',
  });

  const {
    data: statuses,
    isLoading: statusesLoading,
    isError: statusesError,
    refetch: refetchStatuses,
  } = useTaskStatuses(projectId);

  const { mutate: updateTask } = useUpdateTask(projectId);

  const isLoading = tasksLoading || statusesLoading;
  const isError = tasksError || statusesError;

  // Build columns: group tasks by statusId, ordered by status.order
  const columns = useMemo<KanbanColumn[]>(() => {
    if (!statuses || !tasksData) return [];

    const tasksByStatus = new Map<string, Task[]>();

    // Initialize all columns (even empty ones)
    for (const status of statuses) {
      tasksByStatus.set(status.id, []);
    }

    // Distribute tasks into their status columns
    for (const task of tasksData.data) {
      const bucket = tasksByStatus.get(task.statusId);
      if (bucket) {
        bucket.push(task);
      }
    }

    // Sort statuses: Backlog always first, then by order
    const sortedStatuses = [...statuses].sort((a, b) => {
      const aIsBacklog = a.name.toLowerCase() === 'backlog';
      const bIsBacklog = b.name.toLowerCase() === 'backlog';
      if (aIsBacklog && !bIsBacklog) return -1;
      if (!aIsBacklog && bIsBacklog) return 1;
      return a.order - b.order;
    });

    return sortedStatuses.map((status) => ({
      status,
      tasks: tasksByStatus.get(status.id) ?? [],
    }));
  }, [statuses, tasksData]);

  // Optimistic drag handler
  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result;

      // Dropped outside a valid droppable
      if (!destination) return;

      // Dropped in the same position
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      const dragResult: KanbanDragResult = {
        taskId: draggableId,
        sourceStatusId: source.droppableId,
        destinationStatusId: destination.droppableId,
        sourceIndex: source.index,
        destinationIndex: destination.index,
      };

      // ─── Optimistic Update ────────────────────────────────
      // Snapshot current cache for rollback
      const queryKey = QUERY_KEYS.tasks.lists(projectId);
      const previousData = queryClient.getQueryData(queryKey);

      // Mutate the cache optimistically
      queryClient.setQueriesData<PaginatedData<Task>>(
        { queryKey },
        (old) => {
          if (!old) return old;

          const tasks = [...old.data];
          const taskIndex = tasks.findIndex((t) => t.id === dragResult.taskId);
          if (taskIndex === -1) return old;

          const task = tasks[taskIndex];
          const destinationStatus = statuses?.find(
            (s) => s.id === dragResult.destinationStatusId,
          );

          if (!destinationStatus) return old;

          // Update the task's status and order
          const updatedTask: Task = {
            ...task,
            statusId: dragResult.destinationStatusId,
            status: destinationStatus,
            order: dragResult.destinationIndex,
          };

          // Remove from old position
          tasks.splice(taskIndex, 1);

          // Reorder tasks in the destination column
          const destTasks = tasks.filter(
            (t) => t.statusId === dragResult.destinationStatusId,
          );
          const otherTasks = tasks.filter(
            (t) => t.statusId !== dragResult.destinationStatusId,
          );

          destTasks.splice(dragResult.destinationIndex, 0, updatedTask);

          // Update order for all tasks in the destination column
          const reorderedDestTasks = destTasks.map((t, i) => ({
            ...t,
            order: i,
          }));

          return {
            ...old,
            data: [...otherTasks, ...reorderedDestTasks],
          };
        },
      );

      // ─── API Call ─────────────────────────────────────────
      updateTask(
        {
          taskId: dragResult.taskId,
          payload: {
            statusId: dragResult.destinationStatusId,
            order: dragResult.destinationIndex,
          },
        },
        {
          onError: () => {
            // Rollback on failure
            queryClient.setQueriesData({ queryKey }, previousData);
          },
          onSettled: () => {
            // Refetch to sync with server state
            void queryClient.invalidateQueries({ queryKey });
          },
        },
      );
    },
    [projectId, queryClient, statuses, updateTask],
  );

  const refetch = useCallback(() => {
    void refetchTasks();
    void refetchStatuses();
  }, [refetchTasks, refetchStatuses]);

  return {
    columns,
    isLoading,
    isError,
    refetch,
    onDragEnd,
  };
}
