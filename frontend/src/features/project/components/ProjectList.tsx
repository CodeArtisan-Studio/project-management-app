import { ProjectCard } from './ProjectCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/layout/PageContainer';
import { Input } from '@/components/ui/Input';
import type { Project, ProjectStatus } from '../types/project.types';
import type { PaginationMeta } from '@/types/api.types';

const STATUS_OPTIONS: Array<{ value: '' | ProjectStatus; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

interface ProjectListProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: '' | ProjectStatus;
  onStatusChange: (value: '' | ProjectStatus) => void;
  hasFilters: boolean;
  projects: Project[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function ProjectList({
  search,
  onSearchChange,
  status,
  onStatusChange,
  hasFilters,
  projects,
  meta,
  isLoading,
  isError,
  onRetry,
}: ProjectListProps): JSX.Element {
  return (
    <div>
      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-64">
          <Input
            type="search"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as '' | ProjectStatus)}
          className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <ErrorState message="Failed to load projects." onRetry={onRetry} />
      )}

      {/* Empty */}
      {!isLoading && !isError && projects.length === 0 && (
        <EmptyState
          title="No projects found"
          description={
            hasFilters
              ? 'Try adjusting your filters.'
              : 'Create your first project to get started.'
          }
        />
      )}

      {/* Grid */}
      {!isLoading && !isError && projects.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          {meta && meta.total > meta.limit && (
            <p className="mt-4 text-center text-xs text-neutral-500">
              Showing {projects.length} of {meta.total} projects
            </p>
          )}
        </>
      )}
    </div>
  );
}
