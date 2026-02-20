import { z } from 'zod';

// ─── Shared date-range fragment ───────────────────────────
const dateRange = {
  from: z.coerce.date().optional(),
  to:   z.coerce.date().optional(),
};

// ─── GET /api/reports/summary ─────────────────────────────
export const SummaryQuerySchema = z.object({});
export type SummaryQueryInput = z.infer<typeof SummaryQuerySchema>;

// ─── GET /api/reports/tasks-by-project ───────────────────
export const TasksByProjectQuerySchema = z.object({ ...dateRange });
export type TasksByProjectQueryInput = z.infer<typeof TasksByProjectQuerySchema>;

// ─── GET /api/reports/tasks-by-assignee ──────────────────
export const TasksByAssigneeQuerySchema = z.object({
  ...dateRange,
  projectId: z.string().uuid().optional(),
});
export type TasksByAssigneeQueryInput = z.infer<typeof TasksByAssigneeQuerySchema>;

// ─── GET /api/reports/activity-over-time ─────────────────
export const ActivityOverTimeQuerySchema = z.object({
  ...dateRange,
  projectId:   z.string().uuid().optional(),
  granularity: z.enum(['day', 'week']).default('day'),
});
export type ActivityOverTimeQueryInput = z.infer<typeof ActivityOverTimeQuerySchema>;

// ─── GET /api/reports/completion-rate ────────────────────
export const CompletionRateQuerySchema = z.object({
  ...dateRange,
  projectId: z.string().uuid().optional(),
});
export type CompletionRateQueryInput = z.infer<typeof CompletionRateQuerySchema>;
