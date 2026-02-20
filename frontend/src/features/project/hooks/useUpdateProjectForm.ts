import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateProject } from './useProjects';
import {
  updateProjectSchema,
  type UpdateProjectFormValues,
} from '@/features/project/schemas/project.schema';
import { getApiErrorMessage } from '@/lib/utils';
import type { Project } from '@/features/project/types/project.types';

interface UseUpdateProjectFormOptions {
  project: Project;
}

interface UseUpdateProjectFormReturn {
  fields: {
    name: ReturnType<ReturnType<typeof useForm<UpdateProjectFormValues>>['register']>;
    description: ReturnType<ReturnType<typeof useForm<UpdateProjectFormValues>>['register']>;
    status: ReturnType<ReturnType<typeof useForm<UpdateProjectFormValues>>['register']>;
  };
  errors: ReturnType<typeof useForm<UpdateProjectFormValues>>['formState']['errors'];
  isDirty: boolean;
  serverError: string | null;
  successMessage: string | null;
  isSubmitting: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  resetToProject: () => void;
}

export function useUpdateProjectForm({
  project,
}: UseUpdateProjectFormOptions): UseUpdateProjectFormReturn {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { mutateAsync, isPending } = useUpdateProject(project.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description ?? '',
      status: project.status,
    },
  });

  const onSubmit = handleSubmit(async (values: UpdateProjectFormValues): Promise<void> => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await mutateAsync({
        name: values.name,
        status: values.status,
        ...(values.description ? { description: values.description } : { description: '' }),
      });
      setSuccessMessage('Project updated.');
      // Reset dirty state with the new values
      reset(values);
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Failed to update project.'));
    }
  });

  const resetToProject = (): void => {
    reset({
      name: project.name,
      description: project.description ?? '',
      status: project.status,
    });
    setServerError(null);
    setSuccessMessage(null);
  };

  return {
    fields: {
      name: register('name'),
      description: register('description'),
      status: register('status'),
    },
    errors,
    isDirty,
    serverError,
    successMessage,
    isSubmitting: isPending,
    onSubmit,
    resetToProject,
  };
}
