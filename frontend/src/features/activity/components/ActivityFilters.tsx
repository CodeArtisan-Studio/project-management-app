'use client';

import type { ActivityAction } from '../types/activity.types';
import type { ProjectMember } from '@/features/project/types/project.types';

// ─── Action filter options ────────────────────────────────
interface ActionOption {
  value: ActivityAction | '';
  label: string;
  group: string;
}

const ACTION_OPTIONS: ActionOption[] = [
  { value: '',                   label: 'All events',          group: ''       },
  // Project
  { value: 'PROJECT_CREATED',    label: 'Project created',     group: 'Project' },
  { value: 'PROJECT_UPDATED',    label: 'Project updated',     group: 'Project' },
  { value: 'PROJECT_ARCHIVED',   label: 'Project archived',    group: 'Project' },
  { value: 'PROJECT_COMPLETED',  label: 'Project completed',   group: 'Project' },
  { value: 'PROJECT_DELETED',    label: 'Project deleted',     group: 'Project' },
  // Members
  { value: 'MEMBER_ADDED',       label: 'Member added',        group: 'Members' },
  { value: 'MEMBER_REMOVED',     label: 'Member removed',      group: 'Members' },
  // Tasks
  { value: 'TASK_CREATED',       label: 'Task created',        group: 'Tasks'   },
  { value: 'TASK_UPDATED',       label: 'Task updated',        group: 'Tasks'   },
  { value: 'TASK_STATUS_CHANGED',label: 'Task moved',          group: 'Tasks'   },
  { value: 'TASK_ASSIGNED',      label: 'Task assigned',       group: 'Tasks'   },
  { value: 'TASK_UNASSIGNED',    label: 'Task unassigned',     group: 'Tasks'   },
  { value: 'TASK_DELETED',       label: 'Task deleted',        group: 'Tasks'   },
  // Statuses
  { value: 'STATUS_CREATED',     label: 'Status created',      group: 'Statuses' },
  { value: 'STATUS_UPDATED',     label: 'Status updated',      group: 'Statuses' },
  { value: 'STATUS_DELETED',     label: 'Status deleted',      group: 'Statuses' },
];

// ─── Grouped for <optgroup> rendering ─────────────────────
const OPTION_GROUPS = ['Project', 'Members', 'Tasks', 'Statuses'] as const;

// ─── Props ────────────────────────────────────────────────
interface ActivityFiltersProps {
  action:          ActivityAction | '';
  onActionChange:  (action: ActivityAction | '') => void;
  userId:          string;
  onUserIdChange:  (id: string) => void;
  members?:        ProjectMember[];
  hasFilters:      boolean;
  onClear:         () => void;
  total?:          number;
  isLoading:       boolean;
}

// ─── Select styling ───────────────────────────────────────
const selectClass =
  'rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 shadow-sm transition-colors hover:border-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500';

// ─── Component ────────────────────────────────────────────
export function ActivityFilters({
  action,
  onActionChange,
  userId,
  onUserIdChange,
  members,
  hasFilters,
  onClear,
  total,
  isLoading,
}: ActivityFiltersProps): JSX.Element {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
      {/* ── Event type filter ───────────────────────────── */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="activity-action-filter"
          className="text-xs font-medium text-neutral-500"
        >
          Event
        </label>
        <select
          id="activity-action-filter"
          value={action}
          onChange={(e) => onActionChange(e.target.value as ActivityAction | '')}
          className={selectClass}
        >
          <option value="">All events</option>
          {OPTION_GROUPS.map((group) => (
            <optgroup key={group} label={group}>
              {ACTION_OPTIONS.filter((o) => o.group === group).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* ── Actor filter (members dropdown) ─────────────── */}
      {members && members.length > 0 && (
        <div className="flex items-center gap-2">
          <label
            htmlFor="activity-user-filter"
            className="text-xs font-medium text-neutral-500"
          >
            Actor
          </label>
          <select
            id="activity-user-filter"
            value={userId}
            onChange={(e) => onUserIdChange(e.target.value)}
            className={selectClass}
          >
            <option value="">Everyone</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user.firstName} {m.user.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Clear filters ────────────────────────────────── */}
      {hasFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          aria-label="Clear all filters"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
          Clear
        </button>
      )}

      {/* ── Total count ──────────────────────────────────── */}
      {!isLoading && typeof total === 'number' && (
        <span className="ml-auto text-xs text-neutral-400">
          {total.toLocaleString()} event{total !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
