'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getInitials } from '@/lib/utils';
import type { BadgeVariant } from '@/components/ui/Badge';
import type { ProjectMember } from '@/features/project/types/project.types';
import type { UserRole } from '@/types/user.types';

const roleConfig: Record<UserRole, { label: string; variant: BadgeVariant }> = {
  ADMIN: { label: 'Admin', variant: 'danger' },
  MAINTAINER: { label: 'Maintainer', variant: 'warning' },
  MEMBER: { label: 'Member', variant: 'default' },
};

interface MemberListProps {
  members: ProjectMember[];
  ownerId: string;
  canManage: boolean;
  removingUserId: string | null;
  onRemove: (userId: string) => void;
}

export function MemberList({
  members,
  ownerId,
  canManage,
  removingUserId,
  onRemove,
}: MemberListProps): JSX.Element {
  if (members.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-neutral-200 py-10 text-center">
        <p className="text-sm text-neutral-400">No members added yet.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
      {members.map((member) => {
        const { label, variant } = roleConfig[member.user.role];
        const isOwner = member.userId === ownerId;

        return (
          <div
            key={member.id}
            className="flex items-center gap-3 px-4 py-3"
          >
            {/* Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
              {getInitials(member.user.firstName, member.user.lastName)}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {member.user.firstName} {member.user.lastName}
                </p>
                {isOwner && (
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-primary-600">
                    Owner
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-neutral-400">
                {member.user.email}
              </p>
            </div>

            {/* Role badge */}
            <Badge variant={variant} className="shrink-0">
              {label}
            </Badge>

            {/* Remove action */}
            {canManage && !isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(member.userId)}
                isLoading={removingUserId === member.userId}
                className="shrink-0 text-neutral-400 hover:text-red-600"
                aria-label={`Remove ${member.user.firstName}`}
              >
                {removingUserId !== member.userId && (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
