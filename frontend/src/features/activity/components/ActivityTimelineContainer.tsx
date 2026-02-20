'use client';

import { useEffect, useRef } from 'react';
import { useProjectActivity } from '../hooks/useProjectActivity';
import { useActivityFilters } from '../hooks/useActivityFilters';
import { useProjectMembers } from '@/features/project/hooks/useProjects';
import { ActivityTimeline } from './ActivityTimeline';
import { ActivityTimelineSkeleton } from './ActivityTimelineSkeleton';
import { ActivityFilters } from './ActivityFilters';
import { EmptyState, ErrorState } from '@/components/layout/PageContainer';
import { Spinner } from '@/components/ui/Spinner';
import type { Activity } from '../types/activity.types';

interface ActivityTimelineContainerProps {
  projectId: string;
}

export function ActivityTimelineContainer({
  projectId,
}: ActivityTimelineContainerProps): JSX.Element {
  const { action, setAction, userId, setUserId, filters, hasFilters, clearFilters } =
    useActivityFilters();

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProjectActivity(projectId, filters);

  // Fetch project members for the actor filter dropdown
  const { data: membersData } = useProjectMembers(projectId);
  const members = membersData ?? [];

  // Flatten all infinite pages into one list
  const activities: Activity[] = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.meta.total;

  // ─── Infinite scroll via IntersectionObserver ──────────
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div>
      {/* ── Filters ───────────────────────────────────── */}
      <ActivityFilters
        action={action}
        onActionChange={setAction}
        userId={userId}
        onUserIdChange={setUserId}
        members={members}
        hasFilters={hasFilters}
        onClear={clearFilters}
        total={total}
        isLoading={isLoading}
      />

      {/* ── Content ───────────────────────────────────── */}
      {isLoading ? (
        <ActivityTimelineSkeleton />
      ) : isError ? (
        <ErrorState
          message="Failed to load activity."
          onRetry={() => void refetch()}
        />
      ) : activities.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No matching events' : 'No activity yet'}
          description={
            hasFilters
              ? 'Try adjusting or clearing your filters.'
              : 'Activity will appear here as the team makes changes to the project.'
          }
        />
      ) : (
        <>
          <ActivityTimeline activities={activities} />

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="flex justify-center py-6">
            {isFetchingNextPage && <Spinner size="sm" />}
          </div>

          {/* End-of-feed indicator */}
          {!hasNextPage && activities.length > 0 && (
            <p className="py-4 text-center font-mono text-xs text-neutral-400">
              — All events loaded —
            </p>
          )}
        </>
      )}
    </div>
  );
}
