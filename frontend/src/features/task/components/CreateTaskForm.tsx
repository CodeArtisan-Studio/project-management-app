'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { TaskStatus, TaskAssignee } from '@/features/task/types/task.types';
import type { UseFormRegisterReturn, FieldErrors } from 'react-hook-form';
import type { CreateTaskFormValues } from '@/features/task/schemas/task.schema';

interface CreateTaskFormProps {
  fields: {
    title: UseFormRegisterReturn;
    description: UseFormRegisterReturn;
    statusId: UseFormRegisterReturn;
    assigneeId: UseFormRegisterReturn;
  };
  errors: FieldErrors<CreateTaskFormValues>;
  serverError: string | null;
  isSubmitting: boolean;
  statuses: TaskStatus[];
  members: TaskAssignee[];
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onCancel: () => void;
}

export function CreateTaskForm({
  fields,
  errors,
  serverError,
  isSubmitting,
  statuses,
  members,
  onSubmit,
  onCancel,
}: CreateTaskFormProps): JSX.Element {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {serverError && (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <Input
        label="Task title"
        placeholder="e.g. Set up CI pipeline"
        error={errors.title?.message}
        {...fields.title}
      />

      {/* Status select */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700" htmlFor="task-status">
          Status
        </label>
        <select
          id="task-status"
          className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-700 transition-colors hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          {...fields.statusId}
        >
          <option value="">Select a status</option>
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
        {errors.statusId && (
          <p className="text-xs text-red-500">{errors.statusId.message}</p>
        )}
      </div>

      {/* Assignee select */}
      {members.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700" htmlFor="task-assignee">
            Assignee{' '}
            <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <select
            id="task-assignee"
            className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-700 transition-colors hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...fields.assigneeId}
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.firstName} {member.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700" htmlFor="task-description">
          Description{' '}
          <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <textarea
          id="task-description"
          rows={3}
          placeholder="Describe what needs to be done…"
          className="w-full resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors hover:border-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          {...fields.description}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Create task
        </Button>
      </div>
    </form>
  );
}
