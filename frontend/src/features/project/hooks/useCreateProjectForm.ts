'use client';

import { useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateProject } from './useProjects';
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from '../schemas/project.schema';
import { getApiErrorMessage } from '@/lib/utils';

export interface UseCreateProjectFormReturn {
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
  reset: () => void;
}

export function useCreateProjectForm(onSuccess: () => void): UseCreateProjectFormReturn {
  const [serverError, setServerError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useCreateProject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
  });

  const onSubmit = handleSubmit(async (values: CreateProjectFormValues): Promise<void> => {
    setServerError(null);
    try {
      await mutateAsync(values);
      reset();
      setServerError(null);
      onSuccess();
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Failed to create project.'));
    }
  });

  return {
    fields: {
      name: register('name'),
      description: register('description'),
    },
    errors: {
      name: errors.name?.message,
      description: errors.description?.message,
    },
    serverError,
    isPending,
    onSubmit,
    reset: () => {
      reset();
      setServerError(null);
    },
  };
}
