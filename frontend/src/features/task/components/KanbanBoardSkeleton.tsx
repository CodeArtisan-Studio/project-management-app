import { Skeleton } from '@/components/ui/Skeleton';

interface KanbanBoardSkeletonProps {
  columnCount?: number;
}

export function KanbanBoardSkeleton({
  columnCount = 4,
}: KanbanBoardSkeletonProps): JSX.Element {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:overflow-x-visible" style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
      {Array.from({ length: columnCount }).map((_, colIndex) => (
        <div key={colIndex} className="w-72 shrink-0 lg:w-auto lg:min-w-0 lg:flex-1">
          {/* Column header skeleton */}
          <div className="mb-3 flex items-center gap-2 px-1">
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          {/* Card skeletons */}
          <div className="flex flex-col gap-2 rounded-xl bg-neutral-100/50 p-2">
            {Array.from({ length: colIndex === 0 ? 3 : colIndex === 1 ? 2 : 1 }).map(
              (_, cardIndex) => (
                <div
                  key={cardIndex}
                  className="rounded-lg border border-neutral-200/80 bg-white p-3"
                >
                  <Skeleton className="mb-2 h-4 w-4/5" />
                  <Skeleton className="mb-3 h-3 w-full" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
