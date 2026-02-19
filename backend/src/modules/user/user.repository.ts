import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/config/prisma';
import { PaginatedResponse } from '@/types';
import { UpdateProfileInput, GetUsersQueryInput } from './user.dto';

// ─── Safe User Select ────────────────────────────────────
// Excludes the password hash from all user query results.
// Exported so other repositories (e.g. task.repository) can embed it in nested selects.
export const safeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.UserSelect;

// SafeUser is derived directly from the select shape — fully type-safe,
// no manual interface duplication.
export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;

// ─── Orderby Map ─────────────────────────────────────────
// Explicit map avoids dynamic key access and keeps full type safety.
const orderByMap: Record<
  GetUsersQueryInput['sortBy'],
  Prisma.UserOrderByWithRelationInput
> = {
  createdAt: { createdAt: 'asc' },
  firstName: { firstName: 'asc' },
  lastName: { lastName: 'asc' },
  email: { email: 'asc' },
};

export const userRepository = {
  // ─── Find single active user by ID ─────────────────────
  async findById(id: string): Promise<SafeUser | null> {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: safeUserSelect,
    });
  },

  // ─── Find active user by email, optionally excluding an ID ─
  async findByEmail(email: string, excludeId?: string): Promise<SafeUser | null> {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: safeUserSelect,
    });
  },

  // ─── Paginated list of all active users ────────────────
  async findAll(params: GetUsersQueryInput): Promise<PaginatedResponse<SafeUser>> {
    const { page, limit, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = { deletedAt: null };

    // Build orderBy: merge the field key with the requested direction
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      ...orderByMap[sortBy],
      // Override the value with the actual requested sortOrder
      [Object.keys(orderByMap[sortBy])[0]]: sortOrder,
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: safeUserSelect,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  },

  // ─── Update user fields ─────────────────────────────────
  async updateById(id: string, data: UpdateProfileInput): Promise<SafeUser> {
    return prisma.user.update({
      where: { id },
      data,
      select: safeUserSelect,
    });
  },

  // ─── Soft delete — sets deletedAt, preserves the row ───
  async softDeleteById(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
