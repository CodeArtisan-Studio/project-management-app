import { type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface ChartCardProps {
  title:     string;
  subtitle?: string;
  isLoading: boolean;
  isError:   boolean;
  skeletonHeight?: number;
  children:  ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  isLoading,
  isError,
  skeletonHeight = 220,
  children,
}: ChartCardProps): JSX.Element {
  return (
    <div className="h-full rounded-lg border border-neutral-200 bg-white p-5 shadow-card">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-neutral-400">{subtitle}</p>
        )}
      </div>

      {isLoading && (
        <Skeleton style={{ height: skeletonHeight }} className="w-full" />
      )}

      {!isLoading && isError && (
        <div
          className="flex items-center justify-center rounded-md bg-red-50"
          style={{ height: skeletonHeight }}
        >
          <p className="text-sm text-red-500">Failed to load chart data.</p>
        </div>
      )}

      {!isLoading && !isError && children}
    </div>
  );
}
