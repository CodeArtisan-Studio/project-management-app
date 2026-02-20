'use client';

import { Badge } from '@/components/ui/Badge';
import { getInitials } from '@/lib/utils';
import type { Task } from '@/features/task/types/task.types';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-left shadow-card transition-shadow hover:shadow-card-hover"
    >
      <p className="mb-2 text-sm font-medium text-neutral-900 line-clamp-2">{task.title}</p>

      {task.description && (
        <p className="mb-3 text-xs text-neutral-500 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between gap-2">
        {task.status.color ? (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: `${task.status.color}20`, color: task.status.color }}
          >
            {task.status.name}
          </span>
        ) : (
          <Badge variant="default">{task.status.name}</Badge>
        )}

        {task.assignee && (
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700"
            title={`${task.assignee.firstName} ${task.assignee.lastName}`}
          >
            {getInitials(task.assignee.firstName, task.assignee.lastName)}
          </div>
        )}
      </div>
    </button>
  );
}
