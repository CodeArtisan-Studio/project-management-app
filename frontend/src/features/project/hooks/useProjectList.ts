'use client';

import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useProjects } from './useProjects';
import type { GetProjectsQuery, Project, ProjectStatus } from '../types/project.types';
import type { PaginationMeta } from '@/types/api.types';

export interface UseProjectListReturn {
  /** Current search input value (not debounced) */
  search: string;
  setSearch: (value: string) => void;
  /** Current status filter */
  status: '' | ProjectStatus;
  setStatus: (value: '' | ProjectStatus) => void;
  /** Whether a search or status filter is active */
  hasFilters: boolean;
  /** Query results */
  projects: Project[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useProjectList(): UseProjectListReturn {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | ProjectStatus>('');
  const debouncedSearch = useDebounce(search, 400);

  const params: GetProjectsQuery = {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(status && { status }),
  };

  const { data, isLoading, isError, refetch } = useProjects(params);

  return {
    search,
    setSearch,
    status,
    setStatus,
    hasFilters: !!debouncedSearch || !!status,
    projects: data?.data ?? [],
    meta: data?.meta ?? null,
    isLoading,
    isError,
    refetch: () => void refetch(),
  };
}
