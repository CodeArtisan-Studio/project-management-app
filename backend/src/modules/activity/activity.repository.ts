import { Prisma, ActivityAction } from '@/generated/prisma/client';
import { prisma } from '@/config/prisma';
import { PaginatedResponse } from '@/types';
import { GetActivitiesQueryInput } from './activity.dto';

// ─── Activity Select ──────────────────────────────────────
// Includes the acting user's public profile (no password).
const activitySelect = {
  id:        true,
  projectId: true,
  userId:    true,
  action:    true,
  metadata:  true,
  createdAt: true,
  user: {
    select: {
      id:        true,
      firstName: true,
      lastName:  true,
      email:     true,
    },
  },
} satisfies Prisma.ActivitySelect;

export type ActivityRecord = Prisma.ActivityGetPayload<{
  select: typeof activitySelect;
}>;

// ─── Create Input ─────────────────────────────────────────
export interface CreateActivityInput {
  projectId: string;
  userId:    string;
  action:    ActivityAction;
  metadata?: Record<string, unknown>;
}

export const activityRepository = {
  // ─── Persist a single activity event ───────────────────
  async create(data: CreateActivityInput): Promise<ActivityRecord> {
    return prisma.activity.create({
      data: {
        projectId: data.projectId,
        userId:    data.userId,
        action:    data.action,
        // Cast required: Record<string, unknown> is wider than Prisma's InputJsonValue.
        ...(data.metadata !== undefined && {
          metadata: data.metadata as Prisma.InputJsonValue,
        }),
      },
      select: activitySelect,
    });
  },

  // ─── Paginated list scoped to one project ──────────────
  async findAll(
    projectId: string,
    params: GetActivitiesQueryInput,
  ): Promise<PaginatedResponse<ActivityRecord>> {
    const { page, limit, action, userId, from, to, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ActivityWhereInput = {
      projectId,
      ...(action && { action }),
      ...(userId && { userId }),
      ...((from ?? to) && {
        createdAt: {
          ...(from && { gte: from }),
          ...(to   && { lte: to }),
        },
      }),
    };

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        select:  activitySelect,
        skip,
        take:    limit,
        orderBy: { createdAt: sortOrder },
      }),
      prisma.activity.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: activities,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage:     page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  },
};
