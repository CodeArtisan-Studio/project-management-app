import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse, PaginatedResponse } from '@/types';
import { AppError } from '@/utils/appError';
import { taskService } from './task.service';
import { TaskRecord, TaskStatusRecord } from './task.repository';
import { GetTasksQueryInput } from './task.dto';

export const taskController = {
  // ─── Task Status Handlers ────────────────────────────

  // POST /api/projects/:id/statuses
  async createTaskStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('Project ID is required.'));

      const status = await taskService.createTaskStatus(
        id,
        req.user!.userId,
        req.user!.role,
        req.body,
      );

      const response: ApiResponse<TaskStatusRecord> = {
        status: 'success',
        message: 'Task status created successfully.',
        data: status,
      };

      res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/projects/:id/statuses
  async getTaskStatuses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('Project ID is required.'));

      const statuses = await taskService.getTaskStatuses(
        id,
        req.user!.userId,
        req.user!.role,
      );

      const response: ApiResponse<TaskStatusRecord[]> = {
        status: 'success',
        data: statuses,
      };

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/projects/:id/statuses/:statusId
  async updateTaskStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, statusId } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('Project ID is required.'));
      if (typeof statusId !== 'string') return next(AppError.badRequest('Status ID is required.'));

      const status = await taskService.updateTaskStatus(
        id,
        statusId,
        req.user!.userId,
        req.user!.role,
        req.body,
      );

      const response: ApiResponse<TaskStatusRecord> = {
        status: 'success',
        message: 'Task status updated successfully.',
        data: status,
      };

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/projects/:id/statuses/:statusId
  async deleteTaskStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, statusId } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('Project ID is required.'));
      if (typeof statusId !== 'string') return next(AppError.badRequest('Status ID is required.'));

      await taskService.deleteTaskStatus(
        id,
        statusId,
        req.user!.userId,
        req.user!.role,
      );

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },

  // ─── Task Handlers ───────────────────────────────────

  // POST /api/projects/:id/tasks
  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('Project ID is required.'));

      const task = await taskService.createTask(
        id,
        req.user!.userId,
        req.user!.role,
        req.body,
      );

      const response: ApiResponse<TaskRecord> = {
        status: 'success',
        message: 'Task created successfully.',
        data: task,
      };

      res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/projects/:id/tasks
  async getTasksByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('Project ID is required.'));

      const result = await taskService.getTasksByProject(
        id,
        req.user!.userId,
        req.user!.role,
        req.query as unknown as GetTasksQueryInput,
      );

      const response: ApiResponse<PaginatedResponse<TaskRecord>> = {
        status: 'success',
        data: result,
      };

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/projects/:id/tasks/:taskId
  async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, taskId } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('Project ID is required.'));
      if (typeof taskId !== 'string') return next(AppError.badRequest('Task ID is required.'));

      const task = await taskService.getTaskById(
        id,
        taskId,
        req.user!.userId,
        req.user!.role,
      );

      const response: ApiResponse<TaskRecord> = {
        status: 'success',
        data: task,
      };

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/projects/:id/tasks/:taskId
  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, taskId } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('Project ID is required.'));
      if (typeof taskId !== 'string') return next(AppError.badRequest('Task ID is required.'));

      const task = await taskService.updateTask(
        id,
        taskId,
        req.user!.userId,
        req.user!.role,
        req.body,
      );

      const response: ApiResponse<TaskRecord> = {
        status: 'success',
        message: 'Task updated successfully.',
        data: task,
      };

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/projects/:id/tasks/:taskId  [owner | ADMIN]
  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, taskId } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('Project ID is required.'));
      if (typeof taskId !== 'string') return next(AppError.badRequest('Task ID is required.'));

      await taskService.deleteTask(
        id,
        taskId,
        req.user!.userId,
        req.user!.role,
      );

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
};
