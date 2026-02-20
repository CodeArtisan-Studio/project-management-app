'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { UseFormRegisterReturn, FieldErrors } from 'react-hook-form';
import type { UpdateProjectFormValues } from '@/features/project/schemas/project.schema';

interface UpdateProjectFormProps {
  fields: {
    name: UseFormRegisterReturn;
    description: UseFormRegisterReturn;
    status: UseFormRegisterReturn;
  };
  errors: FieldErrors<UpdateProjectFormValues>;
  isDirty: boolean;
  serverError: string | null;
  successMessage: string | null;
  isSubmitting: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onReset: () => void;
}

export function UpdateProjectForm({
  fields,
  errors,
  isDirty,
  serverError,
  successMessage,
  isSubmitting,
  onSubmit,
  onReset,
}: UpdateProjectFormProps): JSX.Element {
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

      {successMessage && !isDirty && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <Input
        label="Project name"
        placeholder="e.g. Marketing Dashboard"
        error={errors.name?.message}
        {...fields.name}
      />

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700" htmlFor="project-description">
          Description{' '}
          <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <textarea
          id="project-description"
          rows={3}
          placeholder="Brief project description…"
          className="w-full resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors hover:border-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          {...fields.description}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700" htmlFor="project-status">
          Status
        </label>
        <select
          id="project-status"
          className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-700 transition-colors hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          {...fields.status}
        >
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
          <option value="COMPLETED">Completed</option>
        </select>
        {errors.status && (
          <p className="text-xs text-red-500">{errors.status.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
          Save changes
        </Button>
        {isDirty && (
          <Button type="button" variant="ghost" onClick={onReset}>
            Discard
          </Button>
        )}
      </div>
    </form>
  );
}
