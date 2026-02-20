'use client';

import { Droppable } from '@hello-pangea/dnd';
import { KanbanCard } from './KanbanCard';
import type { KanbanColumn as KanbanColumnType, Task } from '@/features/task/types/task.types';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onTaskClick: (task: Task) => void;
}

export function KanbanColumn({ column, onTaskClick }: KanbanColumnProps): JSX.Element {
  const { status, tasks } = column;

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-neutral-200 bg-neutral-50 lg:w-auto lg:min-w-0 lg:flex-1">
      {/* Column header */}
      <div className="flex items-center gap-2 border-b border-neutral-200 px-3 py-3">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: status.color ?? '#a1a1aa' }}
        />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          {status.name}
        </h3>
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-neutral-200 px-1.5 text-[10px] font-semibold tabular-nums text-neutral-500">
          {tasks.length}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex min-h-[120px] flex-1 flex-col gap-2 rounded-b-xl p-2 transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary-50/60' : 'bg-transparent'
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-1 items-center justify-center py-8">
                <p className="text-xs text-neutral-300">No tasks</p>
              </div>
            )}
            {tasks.map((task, index) => (
              <KanbanCard
                key={task.id}
                task={task}
                index={index}
                onTaskClick={onTaskClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
