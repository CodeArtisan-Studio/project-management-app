'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { ChartCard } from '@/features/dashboard/components/ChartCard';
import { ActivityTrendChart } from '@/features/dashboard/components/ActivityTrendChart';
import { CompletionRateCard } from './CompletionRateCard';
import { TasksByProjectChart } from './TasksByProjectChart';
import { TasksByAssigneeChart } from './TasksByAssigneeChart';
import { useProjects } from '@/features/project/hooks/useProjects';
import {
  useFilteredCompletionRate,
  useFilteredActivityOverTime,
  useTasksByProject,
  useTasksByAssignee,
} from '@/features/report/hooks/useReport';

// ─── Filter state ─────────────────────────────────────────

interface ReportFilters {
  from:      string; // YYYY-MM-DD
  to:        string; // YYYY-MM-DD
  projectId: string; // '' = all
}

function getDefaultFilters(): ReportFilters {
  const to   = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from:      from.toISOString().slice(0, 10),
    to:        to.toISOString().slice(0, 10),
    projectId: '',
  };
}

// ─── Filter bar ───────────────────────────────────────────

const inputClass =
  'rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 ' +
  'shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

interface FilterBarProps {
  filters:    ReportFilters;
  projects:   { id: string; name: string }[];
  onChange:   (f: ReportFilters) => void;
  onReset:    () => void;
}

function FilterBar({ filters, projects, onChange, onReset }: FilterBarProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      {/* From */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-500">From</label>
        <input
          type="date"
          value={filters.from}
          max={filters.to}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
          className={inputClass}
        />
      </div>

      {/* To */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-500">To</label>
        <input
          type="date"
          value={filters.to}
          min={filters.from}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
          className={inputClass}
        />
      </div>

      {/* Project */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-500">Project</label>
        <select
          value={filters.projectId}
          onChange={(e) => onChange({ ...filters, projectId: e.target.value })}
          className={`${inputClass} min-w-[180px] pr-8`}
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-500 shadow-sm transition-colors hover:border-neutral-300 hover:text-neutral-700"
      >
        Reset
      </button>
    </div>
  );
}

// ─── Date range label ─────────────────────────────────────

function DateRangeLabel({ from, to }: { from: string; to: string }): JSX.Element {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
    });
  return (
    <span className="text-xs text-neutral-400">
      {fmt(from)} – {fmt(to)}
    </span>
  );
}

// ─── Page container ───────────────────────────────────────

export function ReportsPageContainer(): JSX.Element {
  const [filters, setFilters] = useState<ReportFilters>(getDefaultFilters);

  // Memoize query params to prevent spurious re-fetches
  const queryParams = useMemo(() => ({
    from:      filters.from ? `${filters.from}T00:00:00.000Z` : undefined,
    to:        filters.to   ? `${filters.to}T23:59:59.999Z`   : undefined,
    projectId: filters.projectId || undefined,
  }), [filters]);

  // ── Data queries ──────────────────────────────────────
  const {
    data: completionData,
    isLoading: completionLoading,
    isError: completionError,
  } = useFilteredCompletionRate(queryParams);

  const {
    data: activityData,
    isLoading: activityLoading,
    isError: activityError,
  } = useFilteredActivityOverTime({ ...queryParams, granularity: 'day' });

  const {
    data: byProjectData,
    isLoading: byProjectLoading,
    isError: byProjectError,
  } = useTasksByProject(queryParams);

  const {
    data: byAssigneeData,
    isLoading: byAssigneeLoading,
    isError: byAssigneeError,
  } = useTasksByAssignee(queryParams);

  // Projects list for the filter dropdown
  const { data: projectsData } = useProjects({ limit: 100, sortBy: 'name', sortOrder: 'asc' });
  const projects = projectsData?.data ?? [];

  const handleReset = () => setFilters(getDefaultFilters());

  // Derive activity skeleton height from date range length
  const dayCount = useMemo(() => {
    const diff =
      new Date(filters.to).getTime() - new Date(filters.from).getTime();
    return Math.max(7, Math.ceil(diff / 86_400_000));
  }, [filters.from, filters.to]);
  const activitySkeletonH = dayCount > 60 ? 240 : 220;

  return (
    <>
      <Header title="Reports" />
      <PageContainer>
        <PageHeader
          title="Analytics"
          description="Explore task distribution, team workload, and activity trends across your workspace."
        />

        {/* ── Filters ──────────────────────────────────── */}
        <FilterBar
          filters={filters}
          projects={projects}
          onChange={setFilters}
          onReset={handleReset}
        />

        {/* ── Row 1: Completion rate + Activity trend ── */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Completion rate — 1 col */}
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-card">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Completion rate</h3>
                <DateRangeLabel from={filters.from} to={filters.to} />
              </div>
            </div>
            <CompletionRateCard
              totalTasks={completionData?.totalTasks ?? 0}
              completedTasks={completionData?.completedTasks ?? 0}
              completionRate={completionData?.completionRate ?? 0}
              isLoading={completionLoading}
              isError={completionError}
            />
          </div>

          {/* Activity over time — 2 cols */}
          <div className="h-full lg:col-span-2">
            <ChartCard
              title="Activity over time"
              subtitle={`Events per day · ${filters.from} – ${filters.to}`}
              isLoading={activityLoading}
              isError={activityError}
              skeletonHeight={activitySkeletonH}
            >
              <ActivityTrendChart data={activityData ?? []} />
            </ChartCard>
          </div>
        </div>

        {/* ── Row 2: Tasks by project + Tasks by assignee ── */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard
            title="Tasks by project"
            subtitle="Total tasks per project (top 10)"
            isLoading={byProjectLoading}
            isError={byProjectError}
            skeletonHeight={240}
          >
            <TasksByProjectChart data={byProjectData ?? []} />
          </ChartCard>

          <ChartCard
            title="Tasks by assignee"
            subtitle="Total tasks per team member (top 10)"
            isLoading={byAssigneeLoading}
            isError={byAssigneeError}
            skeletonHeight={240}
          >
            <TasksByAssigneeChart data={byAssigneeData ?? []} />
          </ChartCard>
        </div>
      </PageContainer>
    </>
  );
}
