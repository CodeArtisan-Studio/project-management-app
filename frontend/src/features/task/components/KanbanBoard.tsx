'use client';

import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import type { KanbanColumn as KanbanColumnType, Task } from '@/features/task/types/task.types';

interface KanbanBoardProps {
  columns: KanbanColumnType[];
  onDragEnd: (result: DropResult) => void;
  onTaskClick: (task: Task) => void;
}

export function KanbanBoard({ columns, onDragEnd, onTaskClick }: KanbanBoardProps): JSX.Element {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:overflow-x-visible"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((column) => (
          <KanbanColumn
            key={column.status.id}
            column={column}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
