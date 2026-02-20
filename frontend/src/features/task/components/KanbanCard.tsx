'use client';

import { Draggable } from '@hello-pangea/dnd';
import { getInitials } from '@/lib/utils';
import type { Task } from '@/features/task/types/task.types';

interface KanbanCardProps {
  task: Task;
  index: number;
  onTaskClick: (task: Task) => void;
}

export function KanbanCard({ task, index, onTaskClick }: KanbanCardProps): JSX.Element {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onTaskClick(task)}
          className={`group cursor-pointer rounded-lg border bg-white p-3 transition-all ${
            snapshot.isDragging
              ? 'border-primary-300 shadow-lg ring-2 ring-primary-100 rotate-[1.5deg] scale-[1.02]'
              : 'border-neutral-200/80 shadow-card hover:shadow-card-hover hover:border-neutral-300'
          }`}
        >
          {/* Title */}
          <p className="text-[13px] font-semibold leading-snug text-neutral-900 line-clamp-2">
            {task.title}
          </p>

          {/* Description preview */}
          {task.description && (
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-400 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Footer: assignee */}
          {task.assignee && (
            <div className="mt-3 flex items-center gap-2">
              <div
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white"
                title={`${task.assignee.firstName} ${task.assignee.lastName}`}
              >
                {getInitials(task.assignee.firstName, task.assignee.lastName)}
              </div>
              <span className="truncate text-[11px] text-neutral-400">
                {task.assignee.firstName} {task.assignee.lastName}
              </span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
