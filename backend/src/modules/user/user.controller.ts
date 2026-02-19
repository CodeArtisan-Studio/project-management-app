import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse, PaginatedResponse } from '@/types';
import { AppError } from '@/utils/appError';
import { userService } from './user.service';
import { SafeUser } from './user.repository';
import { GetUsersQueryInput } from './user.dto';

export const userController = {
  // GET /api/users/me
  // Returns the authenticated user's own profile.
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getProfile(req.user!.userId);

      const response: ApiResponse<SafeUser> = {
        status: 'success',
        data: user,
      };

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/users/me
  // Updates firstName, lastName, and/or email of the authenticated user.
  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.updateProfile(req.user!.userId, req.body);

      const response: ApiResponse<SafeUser> = {
        status: 'success',
        message: 'Profile updated successfully.',
        data: user,
      };

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/users  [Admin only]
  // Returns a paginated list of all active users.
  // Query params are coerced and validated by GetUsersQuerySchema before this runs.
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.getAllUsers(
        req.query as unknown as GetUsersQueryInput,
      );

      const response: ApiResponse<PaginatedResponse<SafeUser>> = {
        status: 'success',
        data: result,
      };

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/users/:id  [Admin only]
  // Soft deletes a user by setting deletedAt. Row is preserved.
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') return next(AppError.badRequest('User ID is required.'));

      await userService.deleteUser(req.user!.userId, id);

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
};
