import { apiGet } from './api';
import { PaginatedData } from '@/types/api.types';
import type { Activity, GetActivitiesQuery } from '@/features/activity/types/activity.types';

export const activityService = {
  // GET /api/projects/:id/activities
  getProjectActivities(
    projectId: string,
    params?: GetActivitiesQuery,
  ): Promise<PaginatedData<Activity>> {
    return apiGet<PaginatedData<Activity>>(`/projects/${projectId}/activities`, { params });
  },
};
