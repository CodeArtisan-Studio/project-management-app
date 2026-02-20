import { Role } from '@/generated/prisma/client';
import { AppError } from '@/utils/appError';
import { projectRepository } from '@/modules/project/project.repository';
import {
  reportRepository,
  SummaryReport,
  ProjectTaskBreakdown,
  AssigneeTaskBreakdown,
  ActivityDataPoint,
  CompletionRateReport,
} from './report.repository';
import type {
  TasksByProjectQueryInput,
  TasksByAssigneeQueryInput,
  ActivityOverTimeQueryInput,
  CompletionRateQueryInput,
} from './report.dto';

// ─── Project access guard ─────────────────────────────────
// When a specific projectId filter is provided, verify the requester
// actually has access to that project (throws 403 if not).
async function assertProjectAccessIfProvided(
  projectId: string | undefined,
  requesterId: string,
  requesterRole: Role,
): Promise<void> {
  if (!projectId) return;

  const project = await projectRepository.findById(projectId);
  if (!project) throw AppError.notFound('Project not found.');

  if (requesterRole === Role.ADMIN) return;

  if (requesterRole === Role.MAINTAINER && project.ownerId === requesterId) return;

  if (requesterRole === Role.MEMBER) {
    const isMember = await projectRepository.isMember(projectId, requesterId);
    if (isMember) return;
  }

  throw AppError.forbidden('You do not have permission to access this project.');
}

// ─── Service ──────────────────────────────────────────────

export const reportService = {
  // GET /api/reports/summary
  async getSummary(userId: string, role: Role): Promise<SummaryReport> {
    return reportRepository.getSummary(userId, role);
  },

  // GET /api/reports/tasks-by-project
  async getTasksByProject(
    userId: string,
    role:   Role,
    params: TasksByProjectQueryInput,
  ): Promise<ProjectTaskBreakdown[]> {
    return reportRepository.getTasksByProject(userId, role, params);
  },

  // GET /api/reports/tasks-by-assignee
  async getTasksByAssignee(
    userId: string,
    role:   Role,
    params: TasksByAssigneeQueryInput,
  ): Promise<AssigneeTaskBreakdown[]> {
    await assertProjectAccessIfProvided(params.projectId, userId, role);
    return reportRepository.getTasksByAssignee(userId, role, params);
  },

  // GET /api/reports/activity-over-time
  async getActivityOverTime(
    userId: string,
    role:   Role,
    params: ActivityOverTimeQueryInput,
  ): Promise<ActivityDataPoint[]> {
    await assertProjectAccessIfProvided(params.projectId, userId, role);
    return reportRepository.getActivityOverTime(userId, role, params);
  },

  // GET /api/reports/completion-rate
  async getCompletionRate(
    userId: string,
    role:   Role,
    params: CompletionRateQueryInput,
  ): Promise<CompletionRateReport> {
    await assertProjectAccessIfProvided(params.projectId, userId, role);
    return reportRepository.getCompletionRate(userId, role, params);
  },
};
