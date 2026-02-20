'use client';

import { useUpdateProjectForm } from '@/features/project/hooks/useUpdateProjectForm';
import { UpdateProjectForm } from './UpdateProjectForm';
import type { Project } from '@/features/project/types/project.types';

interface UpdateProjectFormContainerProps {
  project: Project;
}

export function UpdateProjectFormContainer({
  project,
}: UpdateProjectFormContainerProps): JSX.Element {
  const form = useUpdateProjectForm({ project });

  return (
    <UpdateProjectForm
      fields={form.fields}
      errors={form.errors}
      isDirty={form.isDirty}
      serverError={form.serverError}
      successMessage={form.successMessage}
      isSubmitting={form.isSubmitting}
      onSubmit={form.onSubmit}
      onReset={form.resetToProject}
    />
  );
}
