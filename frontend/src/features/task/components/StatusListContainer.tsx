'use client';

import { useStatusManager } from '@/features/task/hooks/useStatusManager';
import { StatusList, CreateStatusForm } from './StatusList';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/layout/PageContainer';

interface StatusListContainerProps {
  projectId: string;
  canManage: boolean;
}

export function StatusListContainer({
  projectId,
  canManage,
}: StatusListContainerProps): JSX.Element {
  const {
    statuses,
    isLoading,
    isError,
    refetch,
    isCreating,
    createError,
    handleCreate,
    editingStatusId,
    setEditingStatusId,
    handleRename,
    deletingStatusId,
    deleteError,
    handleDelete,
    onDragEnd,
  } = useStatusManager(projectId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3.5 w-24" />
            <div className="flex-1" />
            <Skeleton className="h-4 w-6" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="Failed to load statuses."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <CreateStatusForm
          isCreating={isCreating}
          createError={createError}
          onCreate={handleCreate}
        />
      )}
      {deleteError && (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          role="alert"
        >
          {deleteError}
        </div>
      )}
      <StatusList
        statuses={statuses}
        canManage={canManage}
        editingStatusId={editingStatusId}
        deletingStatusId={deletingStatusId}
        onDragEnd={onDragEnd}
        onStartEdit={setEditingStatusId}
        onCancelEdit={() => setEditingStatusId(null)}
        onRename={handleRename}
        onDelete={handleDelete}
      />
    </div>
  );
}
