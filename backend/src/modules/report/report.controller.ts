import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '@/types';
import { reportService } from './report.service';
import type {
  TasksByProjectQueryInput,
  TasksByAssigneeQueryInput,
  ActivityOverTimeQueryInput,
  CompletionRateQueryInput,
} from './report.dto';
import type {
  SummaryReport,
  ProjectTaskBreakdown,
  AssigneeTaskBreakdown,
  ActivityDataPoint,
  CompletionRateReport,
} from './report.repository';

export const reportController = {
  // GET /api/reports/summary
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportService.getSummary(req.user!.userId, req.user!.role);
      const response: ApiResponse<SummaryReport> = { status: 'success', data };
      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/reports/tasks-by-project
  async getTasksByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = req.query as unknown as TasksByProjectQueryInput;
      const data = await reportService.getTasksByProject(req.user!.userId, req.user!.role, params);
      const response: ApiResponse<ProjectTaskBreakdown[]> = { status: 'success', data };
      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/reports/tasks-by-assignee
  async getTasksByAssignee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = req.query as unknown as TasksByAssigneeQueryInput;
      const data = await reportService.getTasksByAssignee(req.user!.userId, req.user!.role, params);
      const response: ApiResponse<AssigneeTaskBreakdown[]> = { status: 'success', data };
      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/reports/activity-over-time
  async getActivityOverTime(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = req.query as unknown as ActivityOverTimeQueryInput;
      const data = await reportService.getActivityOverTime(req.user!.userId, req.user!.role, params);
      const response: ApiResponse<ActivityDataPoint[]> = { status: 'success', data };
      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/reports/completion-rate
  async getCompletionRate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = req.query as unknown as CompletionRateQueryInput;
      const data = await reportService.getCompletionRate(req.user!.userId, req.user!.role, params);
      const response: ApiResponse<CompletionRateReport> = { status: 'success', data };
      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },
};
