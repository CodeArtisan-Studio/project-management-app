'use client';

import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/report.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import type {
  GetActivityOverTimeQuery,
  GetTasksByProjectQuery,
  GetTasksByAssigneeQuery,
  GetCompletionRateQuery,
} from '@/features/report/types/report.types';

/** Dashboard summary KPIs — cached 5 minutes. */
export function useSummaryReport() {
  return useQuery({
    queryKey: QUERY_KEYS.reports.summary(),
    queryFn:  reportService.getSummary,
    staleTime: 5 * 60 * 1000,
  });
}

/** Overall task completion rate — cached 5 minutes. */
export function useCompletionRate() {
  return useQuery({
    queryKey: QUERY_KEYS.reports.completionRate(),
    queryFn:  () => reportService.getCompletionRate(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Completion rate with arbitrary filter params. */
export function useFilteredCompletionRate(params?: GetCompletionRateQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.completionRate(params as Record<string, unknown>),
    queryFn:  () => reportService.getCompletionRate(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Daily activity event counts for the past `days` days.
 * Powers the 30-day trend line chart and 7-day bar chart on the dashboard.
 */
export function useActivityTrend(days: number = 30) {
  const to   = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);

  return useQuery({
    queryKey: QUERY_KEYS.reports.activityOverTime({ days }),
    queryFn:  () =>
      reportService.getActivityOverTime({
        from:        from.toISOString(),
        to:          to.toISOString(),
        granularity: 'day',
      }),
    staleTime: 5 * 60 * 1000,
  });
}

/** Activity over time with arbitrary filter params — used on Reports page. */
export function useFilteredActivityOverTime(params?: GetActivityOverTimeQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.activityOverTime(params as Record<string, unknown>),
    queryFn:  () => reportService.getActivityOverTime(params),
    staleTime: 5 * 60 * 1000,
  });
}

/** Tasks grouped by project — used on Reports page. */
export function useTasksByProject(params?: GetTasksByProjectQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.tasksByProject(params as Record<string, unknown>),
    queryFn:  () => reportService.getTasksByProject(params),
    staleTime: 5 * 60 * 1000,
  });
}

/** Tasks grouped by assignee — used on Reports page. */
export function useTasksByAssignee(params?: GetTasksByAssigneeQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.tasksByAssignee(params as Record<string, unknown>),
    queryFn:  () => reportService.getTasksByAssignee(params),
    staleTime: 5 * 60 * 1000,
  });
}
