import { Role } from '@/generated/prisma/client';
import { AppError } from '@/utils/appError';
import { PaginatedResponse } from '@/types';
import { projectRepository } from '@/modules/project/project.repository';
import {
  activityRepository,
  ActivityRecord,
  CreateActivityInput,
} from './activity.repository';
import { GetActivitiesQueryInput } from './activity.dto';

export const activityService = {
  // ─── Log an activity event ────────────────────────────────
  // Called internally by project and task services.
  // Errors are swallowed here so activity recording never breaks
  // the primary business operation that triggered it.
  async log(data: CreateActivityInput): Promise<void> {
    try {
      await activityRepository.create(data);
    } catch (err) {
      console.error('[Activity] Failed to log activity:', err);
    }
  },

  // ─── List activities for a project (paginated) ────────────
  // Access rules match project-level visibility:
  //   ADMIN      → any project
  //   MAINTAINER → projects they own
  //   MEMBER     → projects they are a member of
  async getProjectActivities(
    projectId:     string,
    requesterId:   string,
    requesterRole: Role,
    params:        GetActivitiesQueryInput,
  ): Promise<PaginatedResponse<ActivityRecord>> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw AppError.notFound('Project not found.');

    if (requesterRole === Role.ADMIN) {
      return activityRepository.findAll(projectId, params);
    }

    if (requesterRole === Role.MAINTAINER && project.ownerId === requesterId) {
      return activityRepository.findAll(projectId, params);
    }

    if (requesterRole === Role.MEMBER) {
      const isMember = await projectRepository.isMember(projectId, requesterId);
      if (isMember) return activityRepository.findAll(projectId, params);
    }

    throw AppError.forbidden("You do not have permission to view this project's activity.");
  },
};
