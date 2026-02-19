import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/config/prisma';
import { PaginatedResponse } from '@/types';
import { safeUserSelect } from '@/modules/user/user.repository';
import {
  CreateTaskInput,
  UpdateTaskInput,
  GetTasksQueryInput,
  CreateTaskStatusInput,
  UpdateTaskStatusInput,
} from './task.dto';

// ─── Task Status Select ───────────────────────────────────
const taskStatusSelect = {
  id: true,
  projectId: true,
  name: true,
  color: true,
  order: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TaskStatusSelect;

export type TaskStatusRecord = Prisma.TaskStatusGetPayload<{
  select: typeof taskStatusSelect;
}>;

// ─── Task Select ──────────────────────────────────────────
const taskSelect = {
  id: true,
  projectId: true,
  statusId: true,
  assigneeId: true,
  title: true,
  description: true,
  order: true,
  createdAt: true,
  updatedAt: true,
  status: { select: taskStatusSelect },
  assignee: { select: safeUserSelect },
} satisfies Prisma.TaskSelect;

export type TaskRecord = Prisma.TaskGetPayload<{
  select: typeof taskSelect;
}>;

// ─── OrderBy Map ─────────────────────────────────────────
const orderByMap: Record<
  GetTasksQueryInput['sortBy'],
  Prisma.TaskOrderByWithRelationInput
> = {
  createdAt: { createdAt: 'asc' },
  updatedAt: { updatedAt: 'asc' },
  order: { order: 'asc' },
  title: { title: 'asc' },
};

export const taskRepository = {
  // ─── Task Status Methods ──────────────────────────────

  async createStatus(
    projectId: string,
    data: CreateTaskStatusInput,
  ): Promise<TaskStatusRecord> {
    return prisma.taskStatus.create({
      data: { ...data, projectId },
      select: taskStatusSelect,
    });
  },

  async findStatusById(id: string): Promise<TaskStatusRecord | null> {
    return prisma.taskStatus.findUnique({
      where: { id },
      select: taskStatusSelect,
    });
  },

  async findAllStatuses(projectId: string): Promise<TaskStatusRecord[]> {
    return prisma.taskStatus.findMany({
      where: { projectId },
      select: taskStatusSelect,
      orderBy: { order: 'asc' },
    });
  },

  async updateStatus(id: string, data: UpdateTaskStatusInput): Promise<TaskStatusRecord> {
    return prisma.taskStatus.update({
      where: { id },
      data,
      select: taskStatusSelect,
    });
  },

  async deleteStatus(id: string): Promise<void> {
    await prisma.taskStatus.delete({ where: { id } });
  },

  // Checks if any non-deleted task uses this status — short-circuits on first match.
  async hasTasksWithStatus(statusId: string): Promise<boolean> {
    const task = await prisma.task.findFirst({
      where: { statusId, deletedAt: null },
      select: { id: true },
    });
    return task !== null;
  },

  // ─── Task Methods ─────────────────────────────────────

  async create(projectId: string, data: CreateTaskInput): Promise<TaskRecord> {
    return prisma.task.create({
      data: { ...data, projectId },
      select: taskSelect,
    });
  },

  async findById(id: string): Promise<TaskRecord | null> {
    return prisma.task.findFirst({
      where: { id, deletedAt: null },
      select: taskSelect,
    });
  },

  async findAll(
    projectId: string,
    params: GetTasksQueryInput,
  ): Promise<PaginatedResponse<TaskRecord>> {
    const { page, limit, search, statusId, assigneeId, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {
      projectId,
      deletedAt: null,
      ...(statusId && { statusId }),
      ...(assigneeId && { assigneeId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      ...orderByMap[sortBy],
      [Object.keys(orderByMap[sortBy])[0]]: sortOrder,
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        select: taskSelect,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: tasks,
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

  async updateById(id: string, data: UpdateTaskInput): Promise<TaskRecord> {
    return prisma.task.update({
      where: { id },
      data,
      select: taskSelect,
    });
  },

  async softDeleteById(id: string): Promise<void> {
    await prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
