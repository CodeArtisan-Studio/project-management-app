import { z } from 'zod';

// ─── Create Task ──────────────────────────────────────────
export const CreateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  statusId: z.uuid('Status ID must be a valid UUID'),
  assigneeId: z.uuid('Assignee ID must be a valid UUID').optional(),
  order: z.number().int().min(0).optional(),
});

// ─── Update Task ──────────────────────────────────────────
export const UpdateTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title cannot exceed 200 characters')
      .optional(),
    description: z
      .string()
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional(),
    statusId: z.uuid('Status ID must be a valid UUID').optional(),
    assigneeId: z.uuid('Assignee ID must be a valid UUID').nullable().optional(),
    order: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  });

// ─── Get Tasks Query ──────────────────────────────────────
export const GetTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  statusId: z.uuid().optional(),
  assigneeId: z.uuid().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'order', 'title']).default('order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ─── Create Task Status ───────────────────────────────────
export const CreateTaskStatusSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name cannot exceed 50 characters'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g. #FF5733)')
    .optional(),
  order: z.number().int().min(0).optional(),
});

// ─── Update Task Status ───────────────────────────────────
export const UpdateTaskStatusSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(50, 'Name cannot exceed 50 characters')
      .optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g. #FF5733)')
      .nullable()
      .optional(),
    order: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  });

// ─── Inferred Types ───────────────────────────────────────
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type GetTasksQueryInput = z.infer<typeof GetTasksQuerySchema>;
export type CreateTaskStatusInput = z.infer<typeof CreateTaskStatusSchema>;
export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusSchema>;
