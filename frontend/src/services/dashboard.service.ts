import { apiGet } from './api';

export interface DashboardStats {
  totalProjects: number;
  activeTasks: number;
  teamMembers: number;
}

export const dashboardService = {
  getStats(): Promise<DashboardStats> {
    return apiGet<DashboardStats>('/dashboard/stats');
  },
};
