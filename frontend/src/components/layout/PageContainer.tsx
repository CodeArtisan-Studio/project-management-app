import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps): JSX.Element {
  return (
    <main className={cn('flex-1 overflow-y-auto p-6', className)}>
      {children}
    </main>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps): JSX.Element {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 py-16 text-center">
      <div className="mb-3 rounded-full bg-neutral-100 p-3">
        <svg
          className="h-6 w-6 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Failed to load data.',
  onRetry,
}: ErrorStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-100 bg-red-50 py-12 text-center">
      <p className="text-sm font-medium text-red-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm text-red-600 underline hover:no-underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
