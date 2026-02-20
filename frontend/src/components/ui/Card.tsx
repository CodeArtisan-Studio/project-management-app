import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({
  className,
  padding = 'md',
  children,
  ...props
}: CardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-lg border border-neutral-200 bg-white shadow-card',
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div className={cn('mb-4 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>): JSX.Element {
  return (
    <h3 className={cn('text-base font-semibold text-neutral-900', className)} {...props}>
      {children}
    </h3>
  );
}
