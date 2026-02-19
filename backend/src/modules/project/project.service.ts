import { Role } from '@/generated/prisma/client';
import { AppError } from '@/utils/appError';
import { PaginatedResponse } from '@/types';
import { userRepository } from '@/modules/user/user.repository';
import {
  projectRepository,
  ProjectWithOwner,
  ProjectMemberRecord,
  ProjectScope,
} from './project.repository';
import { CreateProjectInput, UpdateProjectInput, GetProjectsQueryInput } from './project.dto';

// ─── Ownership / admin guard ──────────────────────────────
// Throws 403 unless the requester is the project owner or an ADMIN.
// Used by update, delete, and member management operations.
function assertOwnerOrAdmin(
  project: ProjectWithOwner,
  requesterId: string,
  requesterRole: Role,
): void {
  if (project.ownerId !== requesterId && requesterRole !== Role.ADMIN) {
    throw AppError.forbidden('You do not have permission to modify this project.');
  }
}

export const projectService = {
  // ─── Create a project ────────────────────────────────────
  // Restricted to MAINTAINER and ADMIN at the route level.
  // The caller's userId becomes the project ownerId.
  async createProject(
    requesterId: string,
    data: CreateProjectInput,
  ): Promise<ProjectWithOwner> {
    return projectRepository.create(requesterId, data);
  },

  // ─── Get all projects with pagination + search ───────────
  // ADMIN     → full list across all owners
  // MAINTAINER → only projects they own
  // MEMBER    → only projects where they are a member
  async getAllProjects(
    requesterId: string,
    requesterRole: Role,
    params: GetProjectsQueryInput,
  ): Promise<PaginatedResponse<ProjectWithOwner>> {
    const scope: ProjectScope =
      requesterRole === Role.ADMIN
        ? { kind: 'all' }
        : requesterRole === Role.MAINTAINER
          ? { kind: 'owned', userId: requesterId }
          : { kind: 'member', userId: requesterId };

    return projectRepository.findAll(params, scope);
  },

  // ─── Get a single project by ID ──────────────────────────
  // ADMIN      → any project
  // MAINTAINER → only projects they own
  // MEMBER     → only projects where they are a member
  async getProjectById(
    id: string,
    requesterId: string,
    requesterRole: Role,
  ): Promise<ProjectWithOwner> {
    const project = await projectRepository.findById(id);
    if (!project) throw AppError.notFound('Project not found.');

    if (requesterRole === Role.ADMIN) return project;

    if (requesterRole === Role.MAINTAINER && project.ownerId === requesterId) {
      return project;
    }

    if (requesterRole === Role.MEMBER) {
      const isMember = await projectRepository.isMember(id, requesterId);
      if (isMember) return project;
    }

    throw AppError.forbidden('You do not have permission to view this project.');
  },

  // ─── Update a project ────────────────────────────────────
  // Only the project owner (MAINTAINER) or an ADMIN may update.
  async updateProject(
    id: string,
    requesterId: string,
    requesterRole: Role,
    data: UpdateProjectInput,
  ): Promise<ProjectWithOwner> {
    const project = await projectRepository.findById(id);
    if (!project) throw AppError.notFound('Project not found.');

    assertOwnerOrAdmin(project, requesterId, requesterRole);

    return projectRepository.updateById(id, data);
  },

  // ─── Soft delete a project ────────────────────────────────
  // Only the project owner (MAINTAINER) or an ADMIN may delete.
  async deleteProject(
    id: string,
    requesterId: string,
    requesterRole: Role,
  ): Promise<void> {
    const project = await projectRepository.findById(id);
    if (!project) throw AppError.notFound('Project not found.');

    assertOwnerOrAdmin(project, requesterId, requesterRole);

    await projectRepository.softDeleteById(id);
  },

  // ─── Get project members ──────────────────────────────────
  // Accessible by: project owner (MAINTAINER), ADMIN, or any MEMBER of the project.
  async getProjectMembers(
    projectId: string,
    requesterId: string,
    requesterRole: Role,
  ): Promise<ProjectMemberRecord[]> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw AppError.notFound('Project not found.');

    if (requesterRole !== Role.ADMIN && project.ownerId !== requesterId) {
      const isMember = await projectRepository.isMember(projectId, requesterId);
      if (!isMember) {
        throw AppError.forbidden('You do not have permission to view this project\'s members.');
      }
    }

    return projectRepository.findMembers(projectId);
  },

  // ─── Add a member to a project ───────────────────────────
  // Only the project owner (MAINTAINER) or an ADMIN may add members.
  // Only users with the MEMBER role can be added.
  async addProjectMember(
    projectId: string,
    requesterId: string,
    requesterRole: Role,
    targetUserId: string,
  ): Promise<ProjectMemberRecord> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw AppError.notFound('Project not found.');

    assertOwnerOrAdmin(project, requesterId, requesterRole);

    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) throw AppError.notFound('User not found.');

    if (targetUser.role !== Role.MEMBER) {
      throw AppError.badRequest('Only users with the MEMBER role can be added as project members.');
    }

    if (targetUserId === project.ownerId) {
      throw AppError.badRequest('The project owner cannot be added as a member.');
    }

    const alreadyMember = await projectRepository.isMember(projectId, targetUserId);
    if (alreadyMember) throw AppError.conflict('User is already a member of this project.');

    return projectRepository.addMember(projectId, targetUserId);
  },

  // ─── Remove a member from a project ──────────────────────
  // Only the project owner (MAINTAINER) or an ADMIN may remove members.
  async removeProjectMember(
    projectId: string,
    requesterId: string,
    requesterRole: Role,
    targetUserId: string,
  ): Promise<void> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw AppError.notFound('Project not found.');

    assertOwnerOrAdmin(project, requesterId, requesterRole);

    const isMember = await projectRepository.isMember(projectId, targetUserId);
    if (!isMember) throw AppError.notFound('User is not a member of this project.');

    await projectRepository.removeMember(projectId, targetUserId);
  },
};
