import { z } from 'zod';
import { ProjectStatus } from '@/generated/prisma/client';

// ─── Create Project ───────────────────────────────────────
export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  status: z.enum(ProjectStatus).optional(),
});

// ─── Update Project ───────────────────────────────────────
export const UpdateProjectSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(100, 'Name cannot exceed 100 characters')
      .optional(),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    status: z.enum(ProjectStatus).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  });

// ─── Get Projects Query ───────────────────────────────────
export const GetProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(ProjectStatus).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ─── Add Project Member ───────────────────────────────────
export const AddMemberSchema = z.object({
  userId: z.uuid('User ID must be a valid UUID'),
});

// ─── Inferred Types ───────────────────────────────────────
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type GetProjectsQueryInput = z.infer<typeof GetProjectsQuerySchema>;
export type AddMemberInput = z.infer<typeof AddMemberSchema>;
