import { z } from 'zod';
import { ActivityAction } from '@/generated/prisma/client';

// ─── Get Project Activities Query ─────────────────────────
export const GetActivitiesQuerySchema = z.object({
  page:      z.coerce.number().int().min(1).default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(20),
  action:    z.nativeEnum(ActivityAction).optional(),
  userId:    z.uuid().optional(),
  from:      z.coerce.date().optional(),
  to:        z.coerce.date().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ─── Inferred Types ───────────────────────────────────────
export type GetActivitiesQueryInput = z.infer<typeof GetActivitiesQuerySchema>;
