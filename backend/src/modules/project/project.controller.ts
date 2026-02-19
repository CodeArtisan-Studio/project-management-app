import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse, PaginatedResponse } from '@/types';
import { AppError } from '@/utils/appError';
import { projectService } from './project.service';
import { ProjectWithOwner, ProjectMemberRecord } from './project.repository';
import { GetProjectsQueryInput } from './project.dto';

export const projectController = {
  // POST /api/projects  [MAINTAINER | ADMIN]
  async createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await projectService.createProject(req.user!.userId, req.body);

      const response: ApiResponse<ProjectWithOwner> = {
        status: 'success',
        message: 'Project created successfully.',
        data: project,
      };

      res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/projects
  // ADMIN → all · MAINTAINER → owned · MEMBER → memberships
  // Supports: ?page, ?limit, ?search, ?status, ?sortBy, ?sortOrder
  async getAllProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await projectService.getAllProjects(
        req.user!.userId,
        req.user!.role,
        req.query as unknown as GetProjectsQueryInput,
      );

      const response: ApiResponse<PaginatedResponse<ProjectWithOwner>> = {
        status: 'success',
        data: result,
      };

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/projects/:id
  async getProjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('Project ID is required.'));

      const project = await projectService.getProjectById(
        id,
        req.user!.userId,
        req.user!.role,
      );

      const response: ApiResponse<ProjectWithOwner> = {
        status: 'success',
        data: project,
      };

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/projects/:id  [owner | ADMIN]
  async updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('Project ID is required.'));

      const project = await projectService.updateProject(
        id,
        req.user!.userId,
        req.user!.role,
        req.body,
      );

      const response: ApiResponse<ProjectWithOwner> = {
        status: 'success',
        message: 'Project updated successfully.',
        data: project,
      };

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/projects/:id  [owner | ADMIN]
  async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('Project ID is required.'));

      await projectService.deleteProject(id, req.user!.userId, req.user!.role);

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },

  // GET /api/projects/:id/members  [owner | ADMIN | project member]
  async getProjectMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('Project ID is required.'));

      const members = await projectService.getProjectMembers(
        id,
        req.user!.userId,
        req.user!.role,
      );

      const response: ApiResponse<ProjectMemberRecord[]> = {
        status: 'success',
        data: members,
      };

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/projects/:id/members  [owner | ADMIN]
  async addProjectMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('Project ID is required.'));

      const member = await projectService.addProjectMember(
        id,
        req.user!.userId,
        req.user!.role,
        req.body.userId,
      );

      const response: ApiResponse<ProjectMemberRecord> = {
        status: 'success',
        message: 'Member added successfully.',
        data: member,
      };

      res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/projects/:id/members/:userId  [owner | ADMIN]
  async removeProjectMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, userId } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('Project ID is required.'));
      if (typeof userId !== 'string') return next(AppError.badRequest('User ID is required.'));

      await projectService.removeProjectMember(
        id,
        req.user!.userId,
        req.user!.role,
        userId,
      );

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
};
