import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '@/types';
import { dashboardService } from './dashboard.service';
import { DashboardStats } from './dashboard.repository';

export const dashboardController = {
  // GET /api/dashboard/stats
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.getStats(req.user!.userId, req.user!.role);

      const response: ApiResponse<DashboardStats> = {
        status: 'success',
        data: stats,
      };

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },
};
