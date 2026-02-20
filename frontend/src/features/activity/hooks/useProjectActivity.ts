'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { activityService } from '@/services/activity.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import type { GetActivitiesQuery } from '../types/activity.types';

// ─── Per-page size ────────────────────────────────────────
const PAGE_SIZE = 20;

export function useProjectActivity(
  projectId: string,
  filters: Omit<GetActivitiesQuery, 'page' | 'limit'>,
) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.activities.list(projectId, filters as Record<string, unknown>),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      activityService.getProjectActivities(projectId, {
        ...filters,
        page:  pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled: !!projectId,
  });
}
