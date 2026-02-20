import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional()
    .or(z.literal('')),
  statusId: z.string().min(1, 'Please select a status'),
  assigneeId: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional()
    .or(z.literal('')),
  statusId: z.string().min(1, 'Please select a status'),
  assigneeId: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;
