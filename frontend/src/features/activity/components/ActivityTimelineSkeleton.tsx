import { Skeleton } from '@/components/ui/Skeleton';

// Width variants cycling across skeleton items to mimic real content variance
const WIDTHS = ['w-3/5', 'w-4/5', 'w-2/3', 'w-3/4', 'w-1/2', 'w-5/6'] as const;

interface SkeletonItemProps {
  widthClass: string;
}

function SkeletonItem({ widthClass }: SkeletonItemProps): JSX.Element {
  return (
    <div className="flex gap-3 pb-6">
      {/* Dot + avatar column */}
      <div className="flex shrink-0 flex-col items-center gap-2">
        <Skeleton className="mt-1.5 h-2.5 w-2.5 rounded-full" />
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>
      {/* Content */}
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className={`h-4 ${widthClass}`} />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function ActivityTimelineSkeleton(): JSX.Element {
  return (
    <div className="space-y-8" aria-label="Loading activity" aria-busy="true">
      {[0, 1].map((group) => (
        <div key={group}>
          {/* Date separator skeleton */}
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="h-3 w-16 rounded-full" />
            <div className="h-px flex-1 bg-neutral-200" />
          </div>
          {/* 4 items per group */}
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonItem
              key={i}
              widthClass={WIDTHS[(group * 4 + i) % WIDTHS.length]}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
