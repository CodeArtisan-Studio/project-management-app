import { z } from 'zod';

export const createStatusSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name cannot exceed 50 characters'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color (e.g. #3b82f6)')
    .optional()
    .or(z.literal('')),
});

export type CreateStatusFormValues = z.infer<typeof createStatusSchema>;

export const renameStatusSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name cannot exceed 50 characters'),
});

export type RenameStatusFormValues = z.infer<typeof renameStatusSchema>;
