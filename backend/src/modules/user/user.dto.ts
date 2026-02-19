import { z } from 'zod';

// ─── Update Profile ──────────────────────────────────────
export const UpdateProfileSchema = z
  .object({
    firstName: z.string().min(1, 'First name cannot be empty').optional(),
    lastName: z.string().min(1, 'Last name cannot be empty').optional(),
    email: z.email('Invalid email address').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  });

// ─── Get Users (admin list with pagination) ──────────────
export const GetUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(['createdAt', 'firstName', 'lastName', 'email'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ─── Inferred Types ──────────────────────────────────────
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type GetUsersQueryInput = z.infer<typeof GetUsersQuerySchema>;
