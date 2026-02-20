'use client';

import { useProjectList } from '../hooks/useProjectList';
import { ProjectList } from './ProjectList';

export function ProjectListContainer(): JSX.Element {
  const {
    search,
    setSearch,
    status,
    setStatus,
    hasFilters,
    projects,
    meta,
    isLoading,
    isError,
    refetch,
  } = useProjectList();

  return (
    <ProjectList
      search={search}
      onSearchChange={setSearch}
      status={status}
      onStatusChange={setStatus}
      hasFilters={hasFilters}
      projects={projects}
      meta={meta}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    />
  );
}
