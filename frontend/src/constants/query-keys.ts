export const QUERY_KEYS = {
  projects: {
    all: ['projects'] as const,
    lists: () => [...QUERY_KEYS.projects.all, 'list'] as const,
    list: (params: Record<string, unknown>) =>
      [...QUERY_KEYS.projects.lists(), params] as const,
    detail: (id: string) => [...QUERY_KEYS.projects.all, id] as const,
    members: (id: string) =>
      [...QUERY_KEYS.projects.detail(id), 'members'] as const,
  },
  tasks: {
    all: (projectId: string) => ['tasks', projectId] as const,
    lists: (projectId: string) =>
      [...QUERY_KEYS.tasks.all(projectId), 'list'] as const,
    list: (projectId: string, params: Record<string, unknown>) =>
      [...QUERY_KEYS.tasks.lists(projectId), params] as const,
    detail: (projectId: string, taskId: string) =>
      [...QUERY_KEYS.tasks.all(projectId), taskId] as const,
    statuses: (projectId: string) =>
      [...QUERY_KEYS.tasks.all(projectId), 'statuses'] as const,
  },
  users: {
    all: ['users'] as const,
    me: () => [...QUERY_KEYS.users.all, 'me'] as const,
    lists: () => [...QUERY_KEYS.users.all, 'list'] as const,
    list: (params: Record<string, unknown>) =>
      [...QUERY_KEYS.users.lists(), params] as const,
  },
  dashboard: {
    stats: () => ['dashboard', 'stats'] as const,
  },
  activities: {
    all:   (projectId: string) => ['activities', projectId] as const,
    lists: (projectId: string) =>
      [...QUERY_KEYS.activities.all(projectId), 'list'] as const,
    list: (projectId: string, filters: Record<string, unknown>) =>
      [...QUERY_KEYS.activities.lists(projectId), filters] as const,
  },
  reports: {
    all:             ['reports'] as const,
    summary:         () => ['reports', 'summary'] as const,
    completionRate:  (params?: Record<string, unknown>) =>
      ['reports', 'completion-rate', params] as const,
    activityOverTime: (params: Record<string, unknown>) =>
      ['reports', 'activity-over-time', params] as const,
  },
} as const;
