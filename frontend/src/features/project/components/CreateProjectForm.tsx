import type { UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CreateProjectFormProps {
  fields: {
    name: UseFormRegisterReturn<'name'>;
    description: UseFormRegisterReturn<'description'>;
  };
  errors: {
    name?: string;
    description?: string;
  };
  serverError: string | null;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function CreateProjectForm({
  fields,
  errors,
  serverError,
  isPending,
  onSubmit,
  onCancel,
}: CreateProjectFormProps): JSX.Element {
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
        label="Project name"
        placeholder="e.g. Marketing website redesign"
        error={errors.name}
        {...fields.name}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700" htmlFor="description">
          Description{' '}
          <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="What is this project about?"
          className="w-full resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          {...fields.description}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          Create project
        </Button>
      </div>
    </form>
  );
}
