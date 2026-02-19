import { Role } from '@/generated/prisma/client';
import { AppError } from '@/utils/appError';
import { PaginatedResponse } from '@/types';
import {
  projectRepository,
  ProjectWithOwner,
} from '@/modules/project/project.repository';
import {
  taskRepository,
  TaskRecord,
  TaskStatusRecord,
} from './task.repository';
import {
  CreateTaskInput,
  UpdateTaskInput,
  GetTasksQueryInput,
  CreateTaskStatusInput,
  UpdateTaskStatusInput,
} from './task.dto';

// ─── Project Access Guard ────────────────────────────────
// Resolves the project, verifies it exists, then checks that the requester
// has access (ADMIN: all; MAINTAINER: owned; MEMBER: member-of).
// Returns the project so callers avoid a second DB fetch.
async function assertProjectAccess(
  projectId: string,
  requesterId: string,
  requesterRole: Role,
): Promise<ProjectWithOwner> {
  const project = await projectRepository.findById(projectId);
  if (!project) throw AppError.notFound('Project not found.');

  if (requesterRole === Role.ADMIN) return project;

  if (requesterRole === Role.MAINTAINER && project.ownerId === requesterId) {
    return project;
  }

  if (requesterRole === Role.MEMBER) {
    const isMember = await projectRepository.isMember(projectId, requesterId);
    if (isMember) return project;
  }

  throw AppError.forbidden('You do not have permission to access this project.');
}

// ─── Ownership / Admin Guard ─────────────────────────────
// Throws 403 unless the requester is the project owner or an ADMIN.
function assertOwnerOrAdmin(
  project: ProjectWithOwner,
  requesterId: string,
  requesterRole: Role,
): void {
  if (project.ownerId !== requesterId && requesterRole !== Role.ADMIN) {
    throw AppError.forbidden('You do not have permission to perform this action.');
  }
}

export const taskService = {
  // ─── Task Status: Create ─────────────────────────────
  // Only the project owner (MAINTAINER) or ADMIN may create statuses.
  async createTaskStatus(
    projectId: string,
    requesterId: string,
    requesterRole: Role,
    data: CreateTaskStatusInput,
  ): Promise<TaskStatusRecord> {
    const project = await assertProjectAccess(projectId, requesterId, requesterRole);
    assertOwnerOrAdmin(project, requesterId, requesterRole);
    return taskRepository.createStatus(projectId, data);
  },

  // ─── Task Status: Get All ────────────────────────────
  // Accessible by the project owner, ADMIN, or any project member.
  async getTaskStatuses(
    projectId: string,
    requesterId: string,
    requesterRole: Role,
  ): Promise<TaskStatusRecord[]> {
    await assertProjectAccess(projectId, requesterId, requesterRole);
    return taskRepository.findAllStatuses(projectId);
  },

  // ─── Task Status: Update ─────────────────────────────
  // Only the project owner (MAINTAINER) or ADMIN may update statuses.
  async updateTaskStatus(
    projectId: string,
    statusId: string,
    requesterId: string,
    requesterRole: Role,
    data: UpdateTaskStatusInput,
  ): Promise<TaskStatusRecord> {
    const project = await assertProjectAccess(projectId, requesterId, requesterRole);
    assertOwnerOrAdmin(project, requesterId, requesterRole);

    const status = await taskRepository.findStatusById(statusId);
    if (!status) throw AppError.notFound('Task status not found.');
    if (status.projectId !== projectId) {
      throw AppError.forbidden('Task status does not belong to this project.');
    }

    return taskRepository.updateStatus(statusId, data);
  },

  // ─── Task Status: Delete ─────────────────────────────
  // Only the project owner (MAINTAINER) or ADMIN may delete statuses.
  // Blocked if any active task is using the status.
  async deleteTaskStatus(
    projectId: string,
    statusId: string,
    requesterId: string,
    requesterRole: Role,
  ): Promise<void> {
    const project = await assertProjectAccess(projectId, requesterId, requesterRole);
    assertOwnerOrAdmin(project, requesterId, requesterRole);

    const status = await taskRepository.findStatusById(statusId);
    if (!status) throw AppError.notFound('Task status not found.');
    if (status.projectId !== projectId) {
      throw AppError.forbidden('Task status does not belong to this project.');
    }

    const inUse = await taskRepository.hasTasksWithStatus(statusId);
    if (inUse) {
      throw AppError.conflict(
        'Cannot delete a status that is in use by one or more tasks. Reassign those tasks first.',
      );
    }

    await taskRepository.deleteStatus(statusId);
  },

  // ─── Task: Create ────────────────────────────────────
  // Any authenticated project accessor (owner, admin, member) may create tasks.
  async createTask(
    projectId: string,
    requesterId: string,
    requesterRole: Role,
    data: CreateTaskInput,
  ): Promise<TaskRecord> {
    await assertProjectAccess(projectId, requesterId, requesterRole);

    const status = await taskRepository.findStatusById(data.statusId);
    if (!status) throw AppError.notFound('Task status not found.');
    if (status.projectId !== projectId) {
      throw AppError.badRequest('Task status does not belong to this project.');
    }

    return taskRepository.create(projectId, data);
  },

  // ─── Task: Get All (paginated) ───────────────────────
  async getTasksByProject(
    projectId: string,
    requesterId: string,
    requesterRole: Role,
    params: GetTasksQueryInput,
  ): Promise<PaginatedResponse<TaskRecord>> {
    await assertProjectAccess(projectId, requesterId, requesterRole);
    return taskRepository.findAll(projectId, params);
  },

  // ─── Task: Get by ID ─────────────────────────────────
  async getTaskById(
    projectId: string,
    taskId: string,
    requesterId: string,
    requesterRole: Role,
  ): Promise<TaskRecord> {
    await assertProjectAccess(projectId, requesterId, requesterRole);

    const task = await taskRepository.findById(taskId);
    if (!task) throw AppError.notFound('Task not found.');
    if (task.projectId !== projectId) {
      throw AppError.forbidden('Task does not belong to this project.');
    }

    return task;
  },

  // ─── Task: Update ────────────────────────────────────
  // Any project accessor may update task details or reassign status.
  async updateTask(
    projectId: string,
    taskId: string,
    requesterId: string,
    requesterRole: Role,
    data: UpdateTaskInput,
  ): Promise<TaskRecord> {
    await assertProjectAccess(projectId, requesterId, requesterRole);

    const task = await taskRepository.findById(taskId);
    if (!task) throw AppError.notFound('Task not found.');
    if (task.projectId !== projectId) {
      throw AppError.forbidden('Task does not belong to this project.');
    }

    if (data.statusId) {
      const status = await taskRepository.findStatusById(data.statusId);
      if (!status) throw AppError.notFound('Task status not found.');
      if (status.projectId !== projectId) {
        throw AppError.badRequest('Task status does not belong to this project.');
      }
    }

    return taskRepository.updateById(taskId, data);
  },

  // ─── Task: Soft Delete ───────────────────────────────
  // Only the project owner (MAINTAINER) or ADMIN may delete tasks.
  async deleteTask(
    projectId: string,
    taskId: string,
    requesterId: string,
    requesterRole: Role,
  ): Promise<void> {
    const project = await assertProjectAccess(projectId, requesterId, requesterRole);

    const task = await taskRepository.findById(taskId);
    if (!task) throw AppError.notFound('Task not found.');
    if (task.projectId !== projectId) {
      throw AppError.forbidden('Task does not belong to this project.');
    }

    assertOwnerOrAdmin(project, requesterId, requesterRole);

    await taskRepository.softDeleteById(taskId);
  },
};
