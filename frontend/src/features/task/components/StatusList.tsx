'use client';

import { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import { Button } from '@/components/ui/Button';
import type { TaskStatus } from '@/features/task/types/task.types';

// ─── Preset colors for quick selection ───────────────────
const PRESET_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

interface StatusListProps {
  statuses: TaskStatus[];
  canManage: boolean;
  editingStatusId: string | null;
  deletingStatusId: string | null;
  onDragEnd: (result: DropResult) => void;
  onStartEdit: (statusId: string) => void;
  onCancelEdit: () => void;
  onRename: (statusId: string, name: string) => void;
  onDelete: (statusId: string) => void;
}

export function StatusList({
  statuses,
  canManage,
  editingStatusId,
  deletingStatusId,
  onDragEnd,
  onStartEdit,
  onCancelEdit,
  onRename,
  onDelete,
}: StatusListProps): JSX.Element {
  if (statuses.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-neutral-200 py-10 text-center">
        <p className="text-sm text-neutral-400">No statuses configured.</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="status-list">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white"
          >
            {statuses.map((status, index) => (
              <Draggable
                key={status.id}
                draggableId={status.id}
                index={index}
                isDragDisabled={!canManage}
              >
                {(dragProvided, snapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      snapshot.isDragging
                        ? 'bg-primary-50 shadow-lg rounded-lg'
                        : ''
                    }`}
                  >
                    {/* Drag handle */}
                    {canManage && (
                      <div
                        {...dragProvided.dragHandleProps}
                        className="shrink-0 cursor-grab text-neutral-300 hover:text-neutral-500 active:cursor-grabbing"
                        aria-label="Drag to reorder"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                          <path d="M5 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM5 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                        </svg>
                      </div>
                    )}

                    {/* Color dot */}
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: status.color ?? '#a1a1aa' }}
                    />

                    {/* Name (editable) */}
                    {editingStatusId === status.id ? (
                      <StatusRenameInput
                        currentName={status.name}
                        onSave={(name) => onRename(status.id, name)}
                        onCancel={onCancelEdit}
                      />
                    ) : (
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-800">
                        {status.name}
                      </span>
                    )}

                    {/* Order badge */}
                    <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-neutral-400">
                      #{index + 1}
                    </span>

                    {/* Actions */}
                    {canManage && editingStatusId !== status.id && (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => onStartEdit(status.id)}
                          className="rounded-md p-1 text-neutral-300 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                          aria-label={`Rename ${status.name}`}
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(status.id)}
                          disabled={deletingStatusId === status.id}
                          className="rounded-md p-1 text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                          aria-label={`Delete ${status.name}`}
                        >
                          {deletingStatusId === status.id ? (
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path
                                fillRule="evenodd"
                                d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

// ─── Inline Rename Input ─────────────────────────────────

interface StatusRenameInputProps {
  currentName: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

function StatusRenameInput({ currentName, onSave, onCancel }: StatusRenameInputProps): JSX.Element {
  const [value, setValue] = useState(currentName);

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed && trimmed !== currentName) {
        onSave(trimmed);
      } else {
        onCancel();
      }
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => {
        const trimmed = value.trim();
        if (trimmed && trimmed !== currentName) {
          onSave(trimmed);
        } else {
          onCancel();
        }
      }}
      className="min-w-0 flex-1 rounded-md border border-primary-300 bg-white px-2 py-1 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
      autoFocus
    />
  );
}

// ─── Create Status Form ──────────────────────────────────

interface CreateStatusFormProps {
  isCreating: boolean;
  createError: string | null;
  onCreate: (name: string, color?: string) => Promise<void>;
}

export function CreateStatusForm({
  isCreating,
  createError,
  onCreate,
}: CreateStatusFormProps): JSX.Element {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await onCreate(trimmed, color);
      setName('');
      setColor(PRESET_COLORS[0]);
    } catch {
      // Error displayed via createError prop
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {createError && (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          role="alert"
        >
          {createError}
        </div>
      )}
      <div className="flex items-start gap-2">
        {/* Color picker */}
        <div className="flex shrink-0 flex-wrap gap-1 rounded-md border border-neutral-200 bg-neutral-50 p-1.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-5 w-5 rounded-full transition-all ${
                color === c
                  ? 'ring-2 ring-offset-1 ring-neutral-400 scale-110'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Status name"
          maxLength={50}
          className="h-9 min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <Button type="submit" size="sm" isLoading={isCreating} className="shrink-0">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add
        </Button>
      </div>
    </form>
  );
}
