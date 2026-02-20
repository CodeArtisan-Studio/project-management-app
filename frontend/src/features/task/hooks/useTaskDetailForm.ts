import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateTask } from './useTasks';
import { updateTaskSchema, type UpdateTaskFormValues } from '@/features/task/schemas/task.schema';
import { getApiErrorMessage } from '@/lib/utils';
import type { Task } from '@/features/task/types/task.types';

interface UseTaskDetailFormOptions {
  projectId: string;
  task: Task;
  onSuccess: () => void;
}

interface UseTaskDetailFormReturn {
  fields: {
    title: ReturnType<ReturnType<typeof useForm<UpdateTaskFormValues>>['register']>;
    description: ReturnType<ReturnType<typeof useForm<UpdateTaskFormValues>>['register']>;
    statusId: ReturnType<ReturnType<typeof useForm<UpdateTaskFormValues>>['register']>;
    assigneeId: ReturnType<ReturnType<typeof useForm<UpdateTaskFormValues>>['register']>;
  };
  errors: ReturnType<typeof useForm<UpdateTaskFormValues>>['formState']['errors'];
  serverError: string | null;
  isSubmitting: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function useTaskDetailForm({
  projectId,
  task,
  onSuccess,
}: UseTaskDetailFormOptions): UseTaskDetailFormReturn {
  const [serverError, setServerError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useUpdateTask(projectId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateTaskFormValues>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? '',
      statusId: task.statusId,
      assigneeId: task.assigneeId ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values: UpdateTaskFormValues): Promise<void> => {
    setServerError(null);
    try {
      await mutateAsync({
        taskId: task.id,
        payload: {
          title: values.title,
          statusId: values.statusId,
          description: values.description || undefined,
          assigneeId: values.assigneeId || null,
        },
      });
      onSuccess();
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Failed to update task.'));
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
  };
}
