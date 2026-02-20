import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-neutral-200', className)}
      {...props}
    />
  );
}

export function SkeletonCard(): JSX.Element {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-card">
      <div className="mb-3 flex items-start justify-between">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }): JSX.Element {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-card">
      <div className="border-b border-neutral-200 p-4">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
