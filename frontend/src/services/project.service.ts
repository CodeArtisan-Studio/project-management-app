import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { PaginatedData } from '@/types/api.types';
import type {
  Project,
  ProjectMember,
  CreateProjectPayload,
  UpdateProjectPayload,
  GetProjectsQuery,
} from '@/features/project/types/project.types';

export const projectService = {
  getProjects(params?: GetProjectsQuery): Promise<PaginatedData<Project>> {
    return apiGet<PaginatedData<Project>>('/projects', { params });
  },

  getProjectById(id: string): Promise<Project> {
    return apiGet<Project>(`/projects/${id}`);
  },

  createProject(payload: CreateProjectPayload): Promise<Project> {
    return apiPost<Project>('/projects', payload);
  },

  updateProject(id: string, payload: UpdateProjectPayload): Promise<Project> {
    return apiPatch<Project>(`/projects/${id}`, payload);
  },

  deleteProject(id: string): Promise<void> {
    return apiDelete(`/projects/${id}`);
  },

  getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return apiGet<ProjectMember[]>(`/projects/${projectId}/members`);
  },

  addProjectMember(projectId: string, userId: string): Promise<ProjectMember> {
    return apiPost<ProjectMember>(`/projects/${projectId}/members`, { userId });
  },

  removeProjectMember(projectId: string, userId: string): Promise<void> {
    return apiDelete(`/projects/${projectId}/members/${userId}`);
  },
};
