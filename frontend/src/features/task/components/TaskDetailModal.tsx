'use client';

import { useTaskStatuses } from '@/features/task/hooks/useTasks';
import { useProjectMembers } from '@/features/project/hooks/useProjects';
import { useTaskDetailForm } from '@/features/task/hooks/useTaskDetailForm';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Task } from '@/features/task/types/task.types';

interface TaskDetailModalProps {
  projectId: string;
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailModal({
  projectId,
  task,
  isOpen,
  onClose,
}: TaskDetailModalProps): JSX.Element | null {
  const { data: statuses } = useTaskStatuses(projectId);
  const { data: members } = useProjectMembers(projectId);

  const form = useTaskDetailForm({ projectId, task, onSuccess: onClose });

  const assignees = members?.map((m) => m.user) ?? [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task details" className="max-w-lg">
      <form onSubmit={form.onSubmit} className="space-y-4" noValidate>
        {form.serverError && (
          <div
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {form.serverError}
          </div>
        )}

        <Input
          label="Title"
          placeholder="Task title"
          error={form.errors.title?.message}
          {...form.fields.title}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-neutral-700"
              htmlFor="detail-status"
            >
              Status
            </label>
            <select
              id="detail-status"
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-700 transition-colors hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              {...form.fields.statusId}
            >
              {(statuses ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {form.errors.statusId && (
              <p className="text-xs text-red-500">{form.errors.statusId.message}</p>
            )}
          </div>

          {/* Assignee */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-neutral-700"
              htmlFor="detail-assignee"
            >
              Assignee
            </label>
            <select
              id="detail-assignee"
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-700 transition-colors hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              {...form.fields.assigneeId}
            >
              <option value="">Unassigned</option>
              {assignees.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-medium text-neutral-700"
            htmlFor="detail-description"
          >
            Description{' '}
            <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <textarea
            id="detail-description"
            rows={4}
            placeholder="Describe what needs to be done…"
            className="w-full resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors hover:border-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...form.fields.description}
          />
          {form.errors.description && (
            <p className="text-xs text-red-500">{form.errors.description.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={form.isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
