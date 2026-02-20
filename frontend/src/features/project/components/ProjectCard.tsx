'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { formatDate, getInitials } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import type { Project, ProjectStatus } from '@/features/project/types/project.types';

const statusConfig: Record<ProjectStatus, { label: string; variant: BadgeVariant }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  ARCHIVED: { label: 'Archived', variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'info' },
};

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps): JSX.Element {
  const { label, variant } = statusConfig[project.status];

  return (
    <Link href={ROUTES.PROJECT(project.id)} className="group block">
      <Card className="h-full transition-shadow duration-150 group-hover:shadow-card-hover">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-sm font-semibold text-neutral-900 group-hover:text-primary-700">
            {project.name}
          </h3>
          <Badge variant={variant}>{label}</Badge>
        </div>

        {project.description && (
          <p className="mb-4 line-clamp-2 text-sm text-neutral-500">{project.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-600">
              {getInitials(project.owner.firstName, project.owner.lastName)}
            </div>
            <span className="text-xs text-neutral-500">
              {project.owner.firstName} {project.owner.lastName}
            </span>
          </div>
          <span className="text-xs text-neutral-400">{formatDate(project.createdAt)}</span>
        </div>
      </Card>
    </Link>
  );
}
