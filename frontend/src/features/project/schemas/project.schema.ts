import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']),
});

export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;
