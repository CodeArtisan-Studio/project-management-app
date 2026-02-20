'use client';

import { useState } from 'react';
import { useTasks, useTaskStatuses } from '@/features/task/hooks/useTasks';
import { TaskCard } from './TaskCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/layout/PageContainer';
import type { GetTasksQuery, TaskStatus } from '@/features/task/types/task.types';

interface TaskListProps {
  projectId: string;
}

export function TaskList({ projectId }: TaskListProps): JSX.Element {
  const [selectedStatusId, setSelectedStatusId] = useState<string>('');

  const params: GetTasksQuery = {
    page: 1,
    limit: 50,
    sortBy: 'order',
    sortOrder: 'asc',
    ...(selectedStatusId && { statusId: selectedStatusId }),
  };

  const {
    data: tasksData,
    isLoading: tasksLoading,
    isError: tasksError,
    refetch,
  } = useTasks(projectId, params);

  const { data: statuses, isLoading: statusesLoading } = useTaskStatuses(projectId);

  const isLoading = tasksLoading || statusesLoading;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (tasksError) {
    return (
      <ErrorState
        message="Failed to load tasks."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div>
      {/* Status filter tabs */}
      {statuses && statuses.length > 0 && (
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedStatusId('')}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedStatusId === ''
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All
          </button>
          {statuses.map((status: TaskStatus) => (
            <button
              key={status.id}
              onClick={() => setSelectedStatusId(status.id)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedStatusId === status.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {status.name}
            </button>
          ))}
        </div>
      )}

      {/* Task list */}
      {(!tasksData || tasksData.data.length === 0) ? (
        <EmptyState
          title="No tasks yet"
          description="Add your first task to get started."
        />
      ) : (
        <div className="space-y-2">
          {tasksData.data.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {tasksData.meta.total > tasksData.meta.limit && (
            <p className="pt-2 text-center text-xs text-neutral-500">
              Showing {tasksData.data.length} of {tasksData.meta.total} tasks
            </p>
          )}
        </div>
      )}
    </div>
  );
}
