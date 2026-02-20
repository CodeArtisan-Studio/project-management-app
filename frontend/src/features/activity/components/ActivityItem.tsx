'use client';

import { cn, getInitials } from '@/lib/utils';
import type { Activity, ActivityAction } from '../types/activity.types';

// ─── Action → human-readable label ───────────────────────
const ACTION_LABELS: Record<ActivityAction, string> = {
  PROJECT_CREATED:     'created project',
  PROJECT_UPDATED:     'updated project',
  PROJECT_ARCHIVED:    'archived project',
  PROJECT_COMPLETED:   'completed project',
  PROJECT_DELETED:     'deleted project',
  MEMBER_ADDED:        'added member',
  MEMBER_REMOVED:      'removed member',
  TASK_CREATED:        'created task',
  TASK_UPDATED:        'updated task',
  TASK_STATUS_CHANGED: 'moved task',
  TASK_ASSIGNED:       'assigned task',
  TASK_UNASSIGNED:     'unassigned task',
  TASK_DELETED:        'deleted task',
  STATUS_CREATED:      'created status',
  STATUS_UPDATED:      'updated status',
  STATUS_DELETED:      'deleted status',
};

// ─── Action → timeline dot colour ────────────────────────
const ACTION_DOT: Record<ActivityAction, string> = {
  PROJECT_CREATED:     'bg-primary-500',
  PROJECT_UPDATED:     'bg-primary-400',
  PROJECT_ARCHIVED:    'bg-neutral-400',
  PROJECT_COMPLETED:   'bg-primary-600',
  PROJECT_DELETED:     'bg-red-400',
  MEMBER_ADDED:        'bg-emerald-500',
  MEMBER_REMOVED:      'bg-rose-400',
  TASK_CREATED:        'bg-amber-500',
  TASK_UPDATED:        'bg-amber-400',
  TASK_STATUS_CHANGED: 'bg-amber-600',
  TASK_ASSIGNED:       'bg-amber-500',
  TASK_UNASSIGNED:     'bg-amber-300',
  TASK_DELETED:        'bg-red-400',
  STATUS_CREATED:      'bg-violet-500',
  STATUS_UPDATED:      'bg-violet-400',
  STATUS_DELETED:      'bg-red-400',
};

// ─── Extract a readable entity reference from metadata ────
function getEntityRef(
  action: ActivityAction,
  metadata: Record<string, unknown> | null,
): string | null {
  if (!metadata) return null;

  if (action.startsWith('TASK_') && typeof metadata.taskTitle === 'string') {
    return metadata.taskTitle;
  }
  if (
    (action === 'MEMBER_ADDED' || action === 'MEMBER_REMOVED') &&
    typeof metadata.memberName === 'string'
  ) {
    return metadata.memberName;
  }
  if (action.startsWith('PROJECT_') && typeof metadata.projectName === 'string') {
    return metadata.projectName;
  }
  if (action.startsWith('STATUS_') && typeof metadata.statusName === 'string') {
    return metadata.statusName;
  }
  return null;
}

// ─── Relative / wall-clock timestamp ─────────────────────
function formatRelativeTime(dateString: string): string {
  const date  = new Date(dateString);
  const now   = new Date();
  const diffMs   = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHrs  = Math.floor(diffMins / 60);

  if (diffMins <  1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs  < 24) return `${diffHrs}h ago`;

  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ─── Supplemental metadata line (shown below primary) ─────
function getSupplementalLine(
  action: ActivityAction,
  metadata: Record<string, unknown> | null,
): string | null {
  if (!metadata) return null;

  if (
    action === 'TASK_STATUS_CHANGED' &&
    typeof metadata.fromStatusId === 'string' &&
    typeof metadata.toStatusId === 'string'
  ) {
    // Status IDs only — show a generic movement hint
    return 'status column changed';
  }
  if (action === 'TASK_ASSIGNED' && typeof metadata.assigneeId === 'string') {
    return null; // The assignee name would require an extra lookup; omit for now
  }
  if (
    action === 'MEMBER_REMOVED' &&
    typeof metadata.memberEmail === 'string' &&
    typeof metadata.memberName !== 'string'
  ) {
    return metadata.memberEmail;
  }
  return null;
}

// ─── Props ────────────────────────────────────────────────
interface ActivityItemProps {
  activity: Activity;
  isLast:   boolean;
}

// ─── Component ────────────────────────────────────────────
export function ActivityItem({ activity, isLast }: ActivityItemProps): JSX.Element {
  const { user, action, metadata, createdAt } = activity;
  const initials    = getInitials(user.firstName, user.lastName);
  const label       = ACTION_LABELS[action];
  const dotColor    = ACTION_DOT[action];
  const entityRef   = getEntityRef(action, metadata);
  const supplement  = getSupplementalLine(action, metadata);
  const relTime     = formatRelativeTime(createdAt);
  const absoluteTs  = new Date(createdAt).toLocaleString('en-US');

  return (
    <div className="relative flex gap-3">
      {/* ── Vertical connector line ─────────────────────── */}
      {!isLast && (
        <div
          className="absolute left-[0.8125rem] top-8 bottom-0 w-px bg-neutral-200"
          aria-hidden="true"
        />
      )}

      {/* ── Left column: dot + avatar ────────────────────── */}
      <div className="relative flex shrink-0 flex-col items-center">
        {/* Coloured action dot */}
        <div
          className={cn(
            'mt-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white',
            dotColor,
          )}
          aria-hidden="true"
        />
        {/* Actor avatar */}
        <div
          className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[0.6rem] font-semibold uppercase tracking-wide text-neutral-600"
          aria-label={`${user.firstName} ${user.lastName}`}
        >
          {initials}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="min-w-0 flex-1 pb-6">
        {/* Primary sentence */}
        <p className="text-sm leading-snug text-neutral-700">
          <span className="font-semibold text-neutral-900">
            {user.firstName} {user.lastName}
          </span>{' '}
          <span>{label}</span>
          {entityRef && (
            <>
              {' '}
              <span className="font-medium italic text-neutral-800">
                &ldquo;{entityRef}&rdquo;
              </span>
            </>
          )}
        </p>

        {/* Supplemental detail line */}
        {supplement && (
          <p className="mt-0.5 text-xs text-neutral-500">{supplement}</p>
        )}

        {/* Timestamp */}
        <time
          dateTime={createdAt}
          title={absoluteTs}
          className="mt-1 block font-mono text-[0.7rem] leading-none text-neutral-400"
        >
          {relTime}
        </time>
      </div>
    </div>
  );
}
