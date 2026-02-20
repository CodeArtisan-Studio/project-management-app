import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateTask } from './useTasks';
import { createTaskSchema, type CreateTaskFormValues } from '@/features/task/schemas/task.schema';
import { getApiErrorMessage } from '@/lib/utils';

interface UseCreateTaskFormOptions {
  projectId: string;
  defaultStatusId?: string;
  onSuccess: () => void;
}

interface UseCreateTaskFormReturn {
  fields: {
    title: ReturnType<ReturnType<typeof useForm<CreateTaskFormValues>>['register']>;
    description: ReturnType<ReturnType<typeof useForm<CreateTaskFormValues>>['register']>;
    statusId: ReturnType<ReturnType<typeof useForm<CreateTaskFormValues>>['register']>;
    assigneeId: ReturnType<ReturnType<typeof useForm<CreateTaskFormValues>>['register']>;
  };
  errors: ReturnType<typeof useForm<CreateTaskFormValues>>['formState']['errors'];
  serverError: string | null;
  isSubmitting: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  reset: () => void;
}

export function useCreateTaskForm({
  projectId,
  defaultStatusId,
  onSuccess,
}: UseCreateTaskFormOptions): UseCreateTaskFormReturn {
  const [serverError, setServerError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useCreateTask(projectId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      statusId: defaultStatusId ?? '',
      assigneeId: '',
    },
  });

  const onSubmit = handleSubmit(async (values: CreateTaskFormValues): Promise<void> => {
    setServerError(null);
    try {
      const payload = {
        title: values.title,
        statusId: values.statusId,
        ...(values.description && { description: values.description }),
        ...(values.assigneeId && { assigneeId: values.assigneeId }),
      };
      await mutateAsync(payload);
      reset();
      onSuccess();
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Failed to create task.'));
    }
  });

  return {
    fields: {
      title: register('title'),
      description: register('description'),
      statusId: register('statusId'),
      assigneeId: register('assigneeId'),
    },
    errors,
    serverError,
    isSubmitting: isPending,
    onSubmit,
    reset: () => {
      reset();
      setServerError(null);
    },
  };
}
