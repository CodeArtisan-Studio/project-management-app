import { Role } from '@/generated/prisma/client';
import { dashboardRepository, DashboardStats } from './dashboard.repository';

export const dashboardService = {
  async getStats(userId: string, role: Role): Promise<DashboardStats> {
    return dashboardRepository.getStats(userId, role);
  },
};
