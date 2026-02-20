import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse, PaginatedResponse } from '@/types';
import { AppError } from '@/utils/appError';
import { activityService } from './activity.service';
import { ActivityRecord } from './activity.repository';
import { GetActivitiesQueryInput } from './activity.dto';

export const activityController = {
  // GET /api/projects/:id/activities
  async getProjectActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('Project ID is required.'));

      const result = await activityService.getProjectActivities(
        id,
        req.user!.userId,
        req.user!.role,
        req.query as unknown as GetActivitiesQueryInput,
      );

      const response: ApiResponse<PaginatedResponse<ActivityRecord>> = {
        status: 'success',
        data:   result,
      };

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },
};
