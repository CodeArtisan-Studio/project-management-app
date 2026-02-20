'use client';

import { useState } from 'react';
import { useKanbanBoard } from '@/features/task/hooks/useKanbanBoard';
import { KanbanBoard } from './KanbanBoard';
import { KanbanBoardSkeleton } from './KanbanBoardSkeleton';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { EmptyState, ErrorState } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import type { Task } from '@/features/task/types/task.types';

interface KanbanBoardContainerProps {
  projectId: string;
}

export function KanbanBoardContainer({ projectId }: KanbanBoardContainerProps): JSX.Element {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { columns, isLoading, isError, refetch, onDragEnd } = useKanbanBoard(projectId);

  // Default to Backlog status; fall back to first column if not found
  const backlogStatusId =
    columns.find((col) => col.status.name.toLowerCase() === 'backlog')?.status.id ??
    columns[0]?.status.id;

  const handleTaskClick = (task: Task): void => {
    setSelectedTask(task);
  };

  const handleCloseDetail = (): void => {
    setSelectedTask(null);
  };

  if (isLoading) return <KanbanBoardSkeleton />;

  if (isError) {
    return (
      <ErrorState
        message="Failed to load the board."
        onRetry={() => void refetch()}
      />
    );
  }

  if (columns.length === 0) {
    return (
      <EmptyState
        title="No statuses configured"
        description="Create task statuses to start using the Kanban board."
      />
    );
  }

  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);

  return (
    <>
      {/* Toolbar — single Add Task button */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-neutral-400">
          {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
        </p>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add task
        </Button>
      </div>

      {totalTasks === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Add your first task to get started with the board."
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Add task
            </Button>
          }
        />
      ) : (
        <KanbanBoard columns={columns} onDragEnd={onDragEnd} onTaskClick={handleTaskClick} />
      )}

      <CreateTaskModal
        projectId={projectId}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultStatusId={backlogStatusId}
      />

      {selectedTask !== null && (
        <TaskDetailModal
          projectId={projectId}
          task={selectedTask}
          isOpen
          onClose={handleCloseDetail}
        />
      )}
    </>
  );
}
