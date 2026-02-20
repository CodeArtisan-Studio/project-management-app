'use client';

import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import { useProject } from '@/features/project/hooks/useProjects';
import { useAuth } from '@/providers/AuthProvider';
import { Header } from '@/components/layout/Header';
import { PageContainer, PageHeader, ErrorState } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { KanbanBoardContainer } from '@/features/task/components/KanbanBoardContainer';
import { ProjectSettingsPanel } from '@/features/project/components/ProjectSettingsPanel';
import { ActivityTimelineContainer } from '@/features/activity/components/ActivityTimelineContainer';
import { cn, formatDate } from '@/lib/utils';
import type { BadgeVariant } from '@/components/ui/Badge';
import type { ProjectStatus } from '@/features/project/types/project.types';

const statusConfig: Record<ProjectStatus, { label: string; variant: BadgeVariant }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  ARCHIVED: { label: 'Archived', variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'info' },
};

type PageView = 'board' | 'activity' | 'settings';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps): JSX.Element {
  const { id } = use(params);
  const { user } = useAuth();
  const [view, setView] = useState<PageView>('board');
  const { data: project, isLoading, isError } = useProject(id);

  if (isLoading) {
    return (
      <>
        <Header title="Project" />
        <PageContainer>
          <div className="mb-6 space-y-3">
            <Skeleton className="h-7 w-72" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-64 w-full" />
        </PageContainer>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Header title="Project" />
        <PageContainer>
          <ErrorState message="Failed to load project." />
        </PageContainer>
      </>
    );
  }

  if (!project) {
    notFound();
  }

  const { label, variant } = statusConfig[project.status];
  const isOwnerOrAdmin =
    user?.id === project.ownerId || user?.role === 'ADMIN';

  return (
    <>
      <Header title={project.name} />
      <PageContainer>
        {/* Project header */}
        <PageHeader
          title={project.name}
          description={project.description ?? undefined}
        />

        {/* Project meta */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-card">
          <Badge variant={variant}>{label}</Badge>
          <span className="text-xs text-neutral-400">
            Created {formatDate(project.createdAt)}
          </span>
          <span className="text-xs text-neutral-400">
            Owner: {project.owner.firstName} {project.owner.lastName}
          </span>
          {isOwnerOrAdmin && (
            <span className="ml-auto text-xs font-medium text-primary-600">
              Project owner
            </span>
          )}
        </div>

        {/* Tab bar */}
        <div className="mb-6 flex gap-1 rounded-lg border border-neutral-200 bg-neutral-100 p-1">
          {(
            [
              { key: 'board',    label: 'Board' },
              { key: 'activity', label: 'Activity' },
              { key: 'settings', label: 'Settings' },
            ] as { key: PageView; label: string }[]
          ).map(({ key, label: tabLabel }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                view === key
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700',
              )}
              aria-selected={view === key}
              role="tab"
            >
              {tabLabel}
            </button>
          ))}
        </div>

        {/* View content */}
        {view === 'board' && (
          <KanbanBoardContainer projectId={id} />
        )}

        {view === 'activity' && (
          <ActivityTimelineContainer projectId={id} />
        )}

        {view === 'settings' && (
          <ProjectSettingsPanel
            project={project}
            canManage={isOwnerOrAdmin}
          />
        )}
      </PageContainer>
    </>
  );
}
