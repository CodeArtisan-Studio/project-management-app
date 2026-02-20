import { useState, useCallback, useMemo } from 'react';
import {
  useProjectMembers as useProjectMembersQuery,
  useAddProjectMember,
  useRemoveProjectMember,
} from './useProjects';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/providers/AuthProvider';
import { getApiErrorMessage } from '@/lib/utils';
import type { Project, ProjectMember } from '@/features/project/types/project.types';

interface UseProjectMembersManagerOptions {
  project: Project;
}

interface UseProjectMembersManagerReturn {
  members: ProjectMember[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  canManageMembers: boolean;

  // Add member
  addServerError: string | null;
  isAdding: boolean;
  handleAddMember: (userId: string) => void;

  // Available users for dropdown (filtered to exclude existing members)
  availableUsers: { id: string; firstName: string; lastName: string; email: string }[];
  isLoadingUsers: boolean;

  // Remove member
  removingUserId: string | null;
  handleRemoveMember: (userId: string) => void;
}

export function useProjectMembersManager({
  project,
}: UseProjectMembersManagerOptions): UseProjectMembersManagerReturn {
  const { user } = useAuth();
  const [addServerError, setAddServerError] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const canManageMembers =
    user?.id === project.ownerId || user?.role === 'ADMIN';

  const {
    data: members,
    isLoading,
    isError,
    refetch,
  } = useProjectMembersQuery(project.id);

  // Fetch user list for the dropdown (admin-only, fails gracefully)
  const isAdmin = user?.role === 'ADMIN';
  const { data: usersData, isLoading: isLoadingUsers } = useUsers(
    { page: 1, limit: 100, sortBy: 'firstName', sortOrder: 'asc' },
    isAdmin && canManageMembers,
  );

  const { mutateAsync: addMember, isPending: isAdding } = useAddProjectMember(project.id);
  const { mutateAsync: removeMember } = useRemoveProjectMember(project.id);

  // Filter out existing members and the project owner from the available users list
  const availableUsers = useMemo(() => {
    if (!usersData?.data || !members) return [];

    const existingUserIds = new Set([
      project.ownerId,
      ...members.map((m) => m.userId),
    ]);

    return usersData.data
      .filter((u) => !existingUserIds.has(u.id))
      .map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
      }));
  }, [usersData, members, project.ownerId]);

  const handleAddMember = useCallback(
    (userId: string) => {
      setAddServerError(null);
      addMember(userId).catch((error) => {
        setAddServerError(getApiErrorMessage(error, 'Failed to add member.'));
      });
    },
    [addMember],
  );

  const handleRemoveMember = useCallback(
    (userId: string) => {
      setRemovingUserId(userId);
      removeMember(userId)
        .catch(() => {
          // Error handled silently — the cache refetch will show the member still exists
        })
        .finally(() => {
          setRemovingUserId(null);
        });
    },
    [removeMember],
  );

  return {
    members: members ?? [],
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
  };
}
