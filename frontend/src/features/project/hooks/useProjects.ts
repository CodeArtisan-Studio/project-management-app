import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import type {
  CreateProjectPayload,
  GetProjectsQuery,
  UpdateProjectPayload,
} from '@/features/project/types/project.types';

export function useProjects(params?: GetProjectsQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.projects.list(params as Record<string, unknown>),
    queryFn: () => projectService.getProjects(params),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.projects.detail(id),
    queryFn: () => projectService.getProjectById(id),
    enabled: !!id,
  });
}

export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.projects.members(projectId),
    queryFn: () => projectService.getProjectMembers(projectId),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectService.createProject(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.lists() });
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProjectPayload) => projectService.updateProject(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.detail(id) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.lists() });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.lists() });
    },
  });
}

// ─── Member Mutations ────────────────────────────────────

export function useAddProjectMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => projectService.addProjectMember(projectId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.projects.members(projectId),
      });
    },
  });
}

export function useRemoveProjectMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => projectService.removeProjectMember(projectId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.projects.members(projectId),
      });
    },
  });
}
