import { Role, Prisma } from '@/generated/prisma/client';
import { prisma } from '@/config/prisma';

export interface DashboardStats {
  totalProjects: number;
  activeTasks: number;
  teamMembers: number;
}

// ─── Scope filter (mirrors project.repository logic) ─────
function buildProjectWhere(userId: string, role: Role): Prisma.ProjectWhereInput {
  const base: Prisma.ProjectWhereInput = { deletedAt: null };
  if (role === Role.MAINTAINER) return { ...base, ownerId: userId };
  if (role === Role.MEMBER) return { ...base, members: { some: { userId } } };
  return base; // ADMIN → all projects
}

export const dashboardRepository = {
  async getStats(userId: string, role: Role): Promise<DashboardStats> {
    const projectWhere = buildProjectWhere(userId, role);

    // Tasks are filtered by embedding the same project scope via a
    // nested relation filter — avoids a separate ID-fetch round-trip.
    const taskWhere: Prisma.TaskWhereInput = {
      deletedAt: null,
      project: projectWhere,
    };

    const [totalProjects, activeTasks, teamMembers] = await Promise.all([
      prisma.project.count({ where: projectWhere }),
      prisma.task.count({ where: taskWhere }),
      prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return { totalProjects, activeTasks, teamMembers };
  },
};
