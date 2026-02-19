import { AppError } from '@/utils/appError';
import { PaginatedResponse } from '@/types';
import { userRepository, SafeUser } from './user.repository';
import { UpdateProfileInput, GetUsersQueryInput } from './user.dto';

export const userService = {
  // ─── Get own profile ──────────────────────────────────
  async getProfile(userId: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found.');
    return user;
  },

  // ─── Update own profile ───────────────────────────────
  // Email uniqueness is enforced across all non-deleted users,
  // excluding the requester so they can re-submit their current email.
  async updateProfile(userId: string, data: UpdateProfileInput): Promise<SafeUser> {
    await userService.getProfile(userId);

    if (data.email) {
      const emailTaken = await userRepository.findByEmail(data.email, userId);
      if (emailTaken) throw AppError.conflict('This email address is already in use.');
    }

    return userRepository.updateById(userId, data);
  },

  // ─── Admin: paginated user list ───────────────────────
  async getAllUsers(params: GetUsersQueryInput): Promise<PaginatedResponse<SafeUser>> {
    return userRepository.findAll(params);
  },

  // ─── Admin: soft delete a user ────────────────────────
  // Prevents self-deletion to avoid admins locking themselves out.
  async deleteUser(requesterId: string, targetId: string): Promise<void> {
    if (requesterId === targetId) {
      throw AppError.badRequest('You cannot delete your own account.');
    }

    const user = await userRepository.findById(targetId);
    if (!user) throw AppError.notFound('User not found.');

    await userRepository.softDeleteById(targetId);
  },
};
