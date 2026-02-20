'use client';

import Link from 'next/link';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboard';
import { useSummaryReport, useCompletionRate, useActivityTrend } from '@/features/report/hooks/useReport';
import { useProjects } from '@/features/project/hooks/useProjects';
import { Header } from '@/components/layout/Header';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChartCard } from './ChartCard';
import { TaskStatusDonutChart } from './TaskStatusDonutChart';
import { DailyActivityBarChart } from './DailyActivityBarChart';
import { ActivityTrendChart } from './ActivityTrendChart';
import { ROUTES } from '@/constants/routes';
import type { Project } from '@/features/project/types/project.types';

// ─── Accent palette ───────────────────────────────────────

type Accent = 'blue' | 'green' | 'amber' | 'violet' | 'rose';

const accentIcon: Record<Accent, string> = {
  blue:   'bg-blue-50   text-blue-600',
  green:  'bg-green-50  text-green-600',
  amber:  'bg-amber-50  text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  rose:   'bg-rose-50   text-rose-600',
};

// ─── Stat card ────────────────────────────────────────────

interface StatCardProps {
  label:     string;
  value:     string | number | undefined;
  isLoading: boolean;
  accent:    Accent;
  icon:      JSX.Element;
  sub?:      string;
}

function StatCard({ label, value, isLoading, accent, icon, sub }: StatCardProps): JSX.Element {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentIcon[accent]}`}>
          {icon}
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="mt-2 h-8 w-16" />
      ) : (
        <p className="mt-1 text-2xl font-semibold tabular-nums text-neutral-900">
          {value ?? '—'}
        </p>
      )}
      {sub && !isLoading && (
        <p className="mt-0.5 text-[11px] text-neutral-400">{sub}</p>
      )}
    </div>
  );
}

// ─── Project status badge ─────────────────────────────────

const statusStyles: Record<string, string> = {
  ACTIVE:    'bg-green-100 text-green-700',
  ARCHIVED:  'bg-neutral-100 text-neutral-500',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

function StatusBadge({ status }: { status: string }): JSX.Element {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        statusStyles[status] ?? 'bg-neutral-100 text-neutral-500'
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Recent project card ──────────────────────────────────

function ProjectCard({ project }: { project: Project }): JSX.Element {
  return (
    <Link
      href={ROUTES.PROJECT(project.id)}
      className="group flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-1 text-sm font-semibold text-neutral-900 transition-colors group-hover:text-primary-600">
          {project.name}
        </p>
        <StatusBadge status={project.status} />
      </div>
      {project.description && (
        <p className="line-clamp-2 text-xs leading-relaxed text-neutral-400">
          {project.description}
        </p>
      )}
      <div className="mt-auto flex items-center gap-1.5 text-[11px] text-neutral-400">
        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        <span className="truncate">{project.owner.firstName} {project.owner.lastName}</span>
        <span className="ml-auto shrink-0">
          {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </Link>
  );
}

// ─── Icons ────────────────────────────────────────────────

const IconFolder = (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
  </svg>
);

const IconTasks = (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const IconCheck = (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const IconTrend = (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
  </svg>
);

const IconRate = (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);

// ─── Page container ───────────────────────────────────────

export function DashboardPageContainer(): JSX.Element {
  const { data: stats,   isLoading: statsLoading   } = useDashboardStats();
  const { data: summary, isLoading: summaryLoading, isError: summaryError } = useSummaryReport();
  const { data: rate,    isLoading: rateLoading    } = useCompletionRate();
  const { data: trend,   isLoading: trendLoading,   isError: trendError   } = useActivityTrend(30);

  const { data: recentProjects, isLoading: projectsLoading } = useProjects({
    limit: 4, page: 1, sortBy: 'createdAt', sortOrder: 'desc',
  });

  const hasProjects = (recentProjects?.data.length ?? 0) > 0;
  const completionPct = rate
    ? `${rate.completionRate.toFixed(1)}%`
    : undefined;

  return (
    <>
      <Header title="Dashboard" />
      <PageContainer>
        <PageHeader
          title="Welcome back"
          description="Here's an overview of your workspace."
        />

        {/* ── KPI stat cards ──────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Projects"
            value={summary?.totalProjects ?? stats?.totalProjects}
            isLoading={summaryLoading && statsLoading}
            accent="blue"
            icon={IconFolder}
          />
          <StatCard
            label="Total tasks"
            value={summary?.totalTasks}
            isLoading={summaryLoading}
            accent="violet"
            icon={IconTasks}
          />
          <StatCard
            label="Done this week"
            value={summary?.tasksCompletedThisWeek}
            isLoading={summaryLoading}
            accent="green"
            icon={IconCheck}
            sub="completed tasks"
          />
          <StatCard
            label="Created (30d)"
            value={summary?.tasksCreatedLast30Days}
            isLoading={summaryLoading}
            accent="amber"
            icon={IconTrend}
            sub="new tasks"
          />
          <StatCard
            label="Completion rate"
            value={completionPct}
            isLoading={rateLoading}
            accent="rose"
            icon={IconRate}
            sub={rate ? `${rate.completedTasks} / ${rate.totalTasks} tasks` : undefined}
          />
        </div>

        {/* ── Charts row 1: trend + donut ──────────────────── */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Activity trend — spans 2 cols */}
          <div className="h-full lg:col-span-2">
            <ChartCard
              title="Activity trend"
              subtitle="Events logged over the last 30 days"
              isLoading={trendLoading}
              isError={trendError}
              skeletonHeight={220}
            >
              <ActivityTrendChart data={trend ?? []} />
            </ChartCard>
          </div>

          {/* Task status donut */}
          <ChartCard
            title="Tasks by status"
            isLoading={summaryLoading}
            isError={summaryError}
            skeletonHeight={260}
          >
            <TaskStatusDonutChart
              data={summary?.tasksByStatus ?? []}
              total={summary?.totalTasks ?? 0}
            />
          </ChartCard>
        </div>

        {/* ── Charts row 2: bar + recent projects ─────────── */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Daily activity bar chart */}
          <ChartCard
            title="This week"
            subtitle="Daily events over the last 7 days"
            isLoading={trendLoading}
            isError={trendError}
            skeletonHeight={200}
          >
            <DailyActivityBarChart data={trend ?? []} />
          </ChartCard>

          {/* Recent projects — spans 2 cols */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900">Recent projects</h3>
                <Link
                  href={ROUTES.PROJECTS}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
                >
                  View all
                </Link>
              </div>

              {projectsLoading && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              )}

              {!projectsLoading && !hasProjects && (
                <div className="flex h-36 flex-col items-center justify-center gap-1">
                  <p className="text-sm text-neutral-400">No projects yet.</p>
                  <Link
                    href={ROUTES.PROJECTS}
                    className="text-xs font-medium text-primary-600 hover:underline"
                  >
                    Create your first project
                  </Link>
                </div>
              )}

              {!projectsLoading && hasProjects && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {recentProjects!.data.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
