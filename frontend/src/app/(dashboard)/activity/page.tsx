'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { PageContainer, PageHeader, EmptyState } from '@/components/layout/PageContainer';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { useProjects } from '@/features/project/hooks/useProjects';
import { ActivityTimelineContainer } from '@/features/activity/components/ActivityTimelineContainer';
import type { Project } from '@/features/project/types/project.types';

const STATUS_LABELS: Record<Project['status'], string> = {
  ACTIVE:    'Active',
  ARCHIVED:  'Archived',
  COMPLETED: 'Completed',
};

export default function ActivityPage(): JSX.Element {
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Fetch all accessible projects for the selector
  const { data, isLoading: projectsLoading } = useProjects({ limit: 100, sortBy: 'updatedAt', sortOrder: 'desc' });
  const projects: Project[] = data?.data ?? [];
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <>
      <Header title="Activity" />
      <PageContainer>
        <PageHeader
          title="Activity"
          description="Browse the event log across your projects."
        />

        {/* ── Project selector ──────────────────────────── */}
        <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-card">
          <label
            htmlFor="activity-project-select"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500"
          >
            Project
          </label>

          {projectsLoading ? (
            <div className="flex h-9 items-center">
              <Spinner size="sm" />
            </div>
          ) : projects.length === 0 ? (
            <p className="text-sm text-neutral-500">
              You don&apos;t have access to any projects yet.
            </p>
          ) : (
            <select
              id="activity-project-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full max-w-sm rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 shadow-sm transition-colors hover:border-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 sm:w-auto"
            >
              <option value="">Select a project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {STATUS_LABELS[p.status]}
                </option>
              ))}
            </select>
          )}

          {/* Selected project meta strip */}
          {selectedProject && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  selectedProject.status === 'ACTIVE'
                    ? 'success'
                    : selectedProject.status === 'COMPLETED'
                    ? 'info'
                    : 'default'
                }
              >
                {STATUS_LABELS[selectedProject.status]}
              </Badge>
              <span className="text-xs text-neutral-500">
                Owner:{' '}
                <span className="font-medium text-neutral-700">
                  {selectedProject.owner.firstName} {selectedProject.owner.lastName}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* ── Feed ─────────────────────────────────────── */}
        {!selectedProjectId ? (
          <EmptyState
            title="Select a project"
            description="Choose a project above to view its complete activity log."
          />
        ) : (
          <ActivityTimelineContainer projectId={selectedProjectId} />
        )}
      </PageContainer>
    </>
  );
}
