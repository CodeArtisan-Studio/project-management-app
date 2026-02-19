import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/config/prisma';
import { PaginatedResponse } from '@/types';
import { CreateProjectInput, UpdateProjectInput, GetProjectsQueryInput } from './project.dto';

// ─── Project Select ───────────────────────────────────────
// Includes the owner relation with a safe subset (no password).
const projectSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  ownerId: true,
  owner: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.ProjectSelect;

export type ProjectWithOwner = Prisma.ProjectGetPayload<{
  select: typeof projectSelect;
}>;

// ─── Member Select ────────────────────────────────────────
const memberSelect = {
  id: true,
  projectId: true,
  userId: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.ProjectMemberSelect;

export type ProjectMemberRecord = Prisma.ProjectMemberGetPayload<{
  select: typeof memberSelect;
}>;

// ─── Project Scope ────────────────────────────────────────
// Discriminated union that drives the WHERE clause in findAll.
// 'all'    → ADMIN: no ownership filter
// 'owned'  → MAINTAINER: only projects where ownerId matches
// 'member' → MEMBER: only projects where the user is in project_members
export type ProjectScope =
  | { kind: 'all' }
  | { kind: 'owned'; userId: string }
  | { kind: 'member'; userId: string };

function buildScopeFilter(scope: ProjectScope): Prisma.ProjectWhereInput {
  if (scope.kind === 'owned') return { ownerId: scope.userId };
  if (scope.kind === 'member') return { members: { some: { userId: scope.userId } } };
  return {};
}

// ─── OrderBy Map ─────────────────────────────────────────
const orderByMap: Record<
  GetProjectsQueryInput['sortBy'],
  Prisma.ProjectOrderByWithRelationInput
> = {
  createdAt: { createdAt: 'asc' },
  updatedAt: { updatedAt: 'asc' },
  name: { name: 'asc' },
};

export const projectRepository = {
  // ─── Create a new project ───────────────────────────────
  // Seeds four default task statuses as part of the same write.
  async create(ownerId: string, data: CreateProjectInput): Promise<ProjectWithOwner> {
    return prisma.project.create({
      data: {
        ...data,
        ownerId,
        taskStatuses: {
          createMany: {
            data: [
              { name: 'TODO',        order: 0 },
              { name: 'IN_PROGRESS', order: 1 },
              { name: 'CODE_REVIEW', order: 2 },
              { name: 'DONE',        order: 3 },
            ],
          },
        },
      },
      select: projectSelect,
    });
  },

  // ─── Find single active project by ID ──────────────────
  async findById(id: string): Promise<ProjectWithOwner | null> {
    return prisma.project.findFirst({
      where: { id, deletedAt: null },
      select: projectSelect,
    });
  },

  // ─── Paginated list scoped by role + optional filters ──
  async findAll(
    params: GetProjectsQueryInput,
    scope: ProjectScope,
  ): Promise<PaginatedResponse<ProjectWithOwner>> {
    const { page, limit, search, status, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      deletedAt: null,
      ...buildScopeFilter(scope),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy: Prisma.ProjectOrderByWithRelationInput = {
      ...orderByMap[sortBy],
      [Object.keys(orderByMap[sortBy])[0]]: sortOrder,
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        select: projectSelect,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.project.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: projects,
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

  // ─── Update project fields ──────────────────────────────
  async updateById(id: string, data: UpdateProjectInput): Promise<ProjectWithOwner> {
    return prisma.project.update({
      where: { id },
      data,
      select: projectSelect,
    });
  },

  // ─── Soft delete — sets deletedAt, preserves the row ───
  async softDeleteById(id: string): Promise<void> {
    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  // ─── Check if a user is a member of a project ──────────
  async isMember(projectId: string, userId: string): Promise<boolean> {
    const record = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
      select: { id: true },
    });
    return record !== null;
  },

  // ─── List all members of a project ─────────────────────
  async findMembers(projectId: string): Promise<ProjectMemberRecord[]> {
    return prisma.projectMember.findMany({
      where: { projectId },
      select: memberSelect,
      orderBy: { createdAt: 'asc' },
    });
  },

  // ─── Add a user as a project member ────────────────────
  async addMember(projectId: string, userId: string): Promise<ProjectMemberRecord> {
    return prisma.projectMember.create({
      data: { projectId, userId },
      select: memberSelect,
    });
  },

  // ─── Remove a user from a project ──────────────────────
  async removeMember(projectId: string, userId: string): Promise<void> {
    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  },
};
