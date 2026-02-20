'use client';

import { useProjectMembersManager } from '@/features/project/hooks/useProjectMembers';
import { MemberList } from './MemberList';
import { AddMemberForm } from './AddMemberForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/layout/PageContainer';
import type { Project } from '@/features/project/types/project.types';

interface MemberListContainerProps {
  project: Project;
}

export function MemberListContainer({
  project,
}: MemberListContainerProps): JSX.Element {
  const {
    members,
    isLoading,
    isError,
    refetch,
    canManageMembers,
    addServerError,
    isAdding,
    handleAddMember,
    availableUsers,
    isLoadingUsers,
    removingUserId,
    handleRemoveMember,
  } = useProjectMembersManager({ project });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="Failed to load members."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      {canManageMembers && (
        <AddMemberForm
          serverError={addServerError}
          isSubmitting={isAdding}
          availableUsers={availableUsers}
          isLoadingUsers={isLoadingUsers}
          onAdd={handleAddMember}
        />
      )}
      <MemberList
        members={members}
        ownerId={project.ownerId}
        canManage={canManageMembers}
        removingUserId={removingUserId}
        onRemove={handleRemoveMember}
      />
    </div>
  );
}
