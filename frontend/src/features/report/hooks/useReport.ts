'use client';

import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/report.service';
import { QUERY_KEYS } from '@/constants/query-keys';

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

/**
 * Daily activity event counts for the past `days` days.
 * Powers both the 30-day trend line chart and the 7-day bar chart
 * (the bar chart filters to the last 7 data points client-side).
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
