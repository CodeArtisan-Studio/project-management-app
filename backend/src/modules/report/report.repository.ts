import { Role, Prisma } from '@/generated/prisma/client';

// ─── Date truncation (UTC) ────────────────────────────────
function truncateDate(date: Date, granularity: 'day' | 'week'): string {
  if (granularity === 'day') {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
  }
  // Week: find the ISO Monday of the week (UTC)
  const d = new Date(date);
  const dow = d.getUTCDay(); // 0=Sun…6=Sat
  const daysToMonday = dow === 0 ? 6 : dow - 1;
  d.setUTCDate(d.getUTCDate() - daysToMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
import { prisma } from '@/config/prisma';
import type {
  TasksByProjectQueryInput,
  TasksByAssigneeQueryInput,
  ActivityOverTimeQueryInput,
  CompletionRateQueryInput,
} from './report.dto';

// ─── Return types ─────────────────────────────────────────

export interface TaskStatusCount {
  statusName: string;
  count:      number;
}

export interface SummaryReport {
  totalProjects:         number;
  totalTasks:            number;
  tasksByStatus:         TaskStatusCount[];
  tasksCompletedThisWeek: number;
  tasksCreatedLast30Days: number;
}

export interface ProjectTaskBreakdown {
  projectId:   string;
  projectName: string;
  total:       number;
  byStatus:    TaskStatusCount[];
}

export interface AssigneeTaskBreakdown {
  assigneeId:   string | null;
  assigneeName: string | null;
  total:        number;
  byStatus:     TaskStatusCount[];
}

export interface ActivityDataPoint {
  date:  string; // ISO date string
  count: number;
}

export interface CompletionRateReport {
  totalTasks:     number;
  completedTasks: number;
  completionRate: number; // 0–100, rounded to 2 decimal places
}

// ─── Scope helpers ────────────────────────────────────────

function buildProjectWhere(userId: string, role: Role): Prisma.ProjectWhereInput {
  const base: Prisma.ProjectWhereInput = { deletedAt: null };
  if (role === Role.MAINTAINER) return { ...base, ownerId: userId };
  if (role === Role.MEMBER)     return { ...base, members: { some: { userId } } };
  return base; // ADMIN → all projects
}

/**
 * Returns IDs of projects accessible to the user.
 * Returns null for unrestricted ADMIN access (use no project filter).
 * An optional `projectIdFilter` narrows to a single specific project.
 */
async function getAccessibleProjectIds(
  userId:          string,
  role:            Role,
  projectIdFilter?: string,
): Promise<string[] | null> {
  // ADMIN with no specific project → no restriction
  if (role === Role.ADMIN && !projectIdFilter) return null;

  const where: Prisma.ProjectWhereInput = {
    ...buildProjectWhere(userId, role),
    ...(projectIdFilter ? { id: projectIdFilter } : {}),
  };

  const rows = await prisma.project.findMany({ where, select: { id: true } });
  return rows.map((r) => r.id);
}

/** Builds a Prisma WHERE fragment for task project scoping. */
function buildTaskProjectWhere(
  userId: string,
  role:   Role,
): Prisma.ProjectWhereInput {
  return buildProjectWhere(userId, role);
}

// ─── Repository ───────────────────────────────────────────

export const reportRepository = {
  // ── GET /api/reports/summary ─────────────────────────────
  async getSummary(userId: string, role: Role): Promise<SummaryReport> {
    const projectWhere = buildProjectWhere(userId, role);
    const taskWhere: Prisma.TaskWhereInput = {
      deletedAt: null,
      project:   projectWhere,
    };

    // Start of current ISO week (Monday 00:00:00 UTC)
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0=Sun..6=Sat
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysToMonday));

    const thirtyDaysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30));

    // 1. Counts that share the same base where clause
    const [totalProjects, totalTasks, tasksCompletedThisWeek, tasksCreatedLast30Days] =
      await Promise.all([
        prisma.project.count({ where: projectWhere }),
        prisma.task.count({ where: taskWhere }),
        prisma.task.count({
          where: {
            ...taskWhere,
            status:    { name: 'DONE' },
            updatedAt: { gte: startOfWeek },
          },
        }),
        prisma.task.count({
          where: {
            ...taskWhere,
            createdAt: { gte: thirtyDaysAgo },
          },
        }),
      ]);

    // 2. Tasks-by-status: groupBy statusId + resolve names in one extra query
    const grouped = await prisma.task.groupBy({
      by:    ['statusId'],
      where: taskWhere,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const statusIds = grouped.map((g) => g.statusId);
    const statuses  = statusIds.length > 0
      ? await prisma.taskStatus.findMany({
          where:  { id: { in: statusIds } },
          select: { id: true, name: true },
        })
      : [];

    const statusNameById = new Map(statuses.map((s) => [s.id, s.name]));

    const tasksByStatus: TaskStatusCount[] = grouped.map((g) => ({
      statusName: statusNameById.get(g.statusId) ?? 'Unknown',
      count:      g._count.id,
    }));

    return {
      totalProjects,
      totalTasks,
      tasksByStatus,
      tasksCompletedThisWeek,
      tasksCreatedLast30Days,
    };
  },

  // ── GET /api/reports/tasks-by-project ────────────────────
  async getTasksByProject(
    userId: string,
    role:   Role,
    params: TasksByProjectQueryInput,
  ): Promise<ProjectTaskBreakdown[]> {
    const { from, to } = params;

    const createdAtFilter: Prisma.DateTimeFilter | undefined =
      from ?? to
        ? { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) }
        : undefined;

    const projects = await prisma.project.findMany({
      where: buildProjectWhere(userId, role),
      select: {
        id:   true,
        name: true,
        tasks: {
          where: {
            deletedAt: null,
            ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
          },
          select: {
            status: { select: { name: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return projects.map((p) => {
      const byStatusMap = new Map<string, number>();
      for (const task of p.tasks) {
        const name = task.status.name;
        byStatusMap.set(name, (byStatusMap.get(name) ?? 0) + 1);
      }
      const byStatus = [...byStatusMap.entries()]
        .map(([statusName, count]) => ({ statusName, count }))
        .sort((a, b) => b.count - a.count);

      return {
        projectId:   p.id,
        projectName: p.name,
        total:       p.tasks.length,
        byStatus,
      };
    });
  },

  // ── GET /api/reports/tasks-by-assignee ───────────────────
  async getTasksByAssignee(
    userId: string,
    role:   Role,
    params: TasksByAssigneeQueryInput,
  ): Promise<AssigneeTaskBreakdown[]> {
    const { from, to, projectId: projectIdFilter } = params;

    const projectWhere: Prisma.ProjectWhereInput = {
      ...buildProjectWhere(userId, role),
      ...(projectIdFilter ? { id: projectIdFilter } : {}),
    };

    const createdAtFilter: Prisma.DateTimeFilter | undefined =
      from ?? to
        ? { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) }
        : undefined;

    const tasks = await prisma.task.findMany({
      where: {
        deletedAt: null,
        project:   projectWhere,
        ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
      },
      select: {
        assigneeId: true,
        assignee: {
          select: { id: true, firstName: true, lastName: true },
        },
        status: { select: { name: true } },
      },
    });

    // Aggregate in JS — group by assigneeId (null → unassigned bucket)
    const buckets = new Map<
      string,
      { assigneeId: string | null; assigneeName: string | null; byStatus: Map<string, number>; total: number }
    >();

    for (const task of tasks) {
      const key = task.assigneeId ?? '__unassigned__';
      if (!buckets.has(key)) {
        buckets.set(key, {
          assigneeId:   task.assigneeId,
          assigneeName: task.assignee
            ? `${task.assignee.firstName} ${task.assignee.lastName}`
            : null,
          byStatus: new Map(),
          total:    0,
        });
      }
      const bucket = buckets.get(key)!;
      bucket.total++;
      const sn = task.status.name;
      bucket.byStatus.set(sn, (bucket.byStatus.get(sn) ?? 0) + 1);
    }

    return [...buckets.values()]
      .sort((a, b) => {
        // Unassigned last, then alphabetical
        if (a.assigneeName === null) return 1;
        if (b.assigneeName === null) return -1;
        return a.assigneeName.localeCompare(b.assigneeName);
      })
      .map((b) => ({
        assigneeId:   b.assigneeId,
        assigneeName: b.assigneeName,
        total:        b.total,
        byStatus:     [...b.byStatus.entries()]
          .map(([statusName, count]) => ({ statusName, count }))
          .sort((a, b) => b.count - a.count),
      }));
  },

  // ── GET /api/reports/activity-over-time ──────────────────
  // Uses findMany + JS date grouping to avoid $queryRaw and the pg adapter
  // pool teardown race condition that occurs in test environments.
  async getActivityOverTime(
    userId: string,
    role:   Role,
    params: ActivityOverTimeQueryInput,
  ): Promise<ActivityDataPoint[]> {
    const { from, to, projectId: projectIdFilter, granularity } = params;

    const projectIds = await getAccessibleProjectIds(userId, role, projectIdFilter);

    // If the user has no accessible projects, return empty immediately
    if (projectIds !== null && projectIds.length === 0) return [];

    const activities = await prisma.activity.findMany({
      where: {
        ...(projectIds !== null ? { projectId: { in: projectIds } } : {}),
        ...((from ?? to) && {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to   ? { lte: to }   : {}),
          },
        }),
      },
      select:  { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by truncated date in JS (UTC)
    const buckets = new Map<string, number>();
    for (const a of activities) {
      const bucket = truncateDate(a.createdAt, granularity);
      buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
    }

    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  },

  // ── GET /api/reports/completion-rate ─────────────────────
  async getCompletionRate(
    userId: string,
    role:   Role,
    params: CompletionRateQueryInput,
  ): Promise<CompletionRateReport> {
    const { from, to, projectId: projectIdFilter } = params;

    const projectWhere: Prisma.ProjectWhereInput = {
      ...buildProjectWhere(userId, role),
      ...(projectIdFilter ? { id: projectIdFilter } : {}),
    };

    const createdAtFilter: Prisma.DateTimeFilter | undefined =
      from ?? to
        ? { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) }
        : undefined;

    const baseWhere: Prisma.TaskWhereInput = {
      deletedAt: null,
      project:   projectWhere,
      ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
    };

    const [totalTasks, completedTasks] = await Promise.all([
      prisma.task.count({ where: baseWhere }),
      prisma.task.count({ where: { ...baseWhere, status: { name: 'DONE' } } }),
    ]);

    const completionRate =
      totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 10_000) / 100; // e.g. 66.67

    return { totalTasks, completedTasks, completionRate };
  },
};
