'use client';

import type { Activity } from '../types/activity.types';
import { ActivityItem } from './ActivityItem';

// ─── Date group label ─────────────────────────────────────
function getDateLabel(dateString: string): string {
  const date      = new Date(dateString);
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString())     return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
  });
}

// ─── Group activities by calendar date ────────────────────
interface ActivityGroup {
  label: string;
  items: Activity[];
}

function groupByDate(activities: Activity[]): ActivityGroup[] {
  const groups = new Map<string, Activity[]>();

  for (const activity of activities) {
    const label    = getDateLabel(activity.createdAt);
    const existing = groups.get(label) ?? [];
    groups.set(label, [...existing, activity]);
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

// ─── Props ────────────────────────────────────────────────
interface ActivityTimelineProps {
  activities: Activity[];
}

// ─── Component ────────────────────────────────────────────
export function ActivityTimeline({ activities }: ActivityTimelineProps): JSX.Element {
  const groups      = groupByDate(activities);
  const lastGroupIdx = groups.length - 1;

  if (activities.length === 0) return <></>;

  return (
    <div className="space-y-8">
      {groups.map((group, groupIdx) => (
        <section key={group.label} aria-label={`Activity for ${group.label}`}>
          {/* ── Date separator ────────────────────────── */}
          <div className="mb-4 flex items-center gap-3" aria-hidden="true">
            <span className="shrink-0 text-[0.7rem] font-semibold uppercase tracking-widest text-neutral-500">
              {group.label}
            </span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          {/* ── Activity items ────────────────────────── */}
          <div>
            {group.items.map((activity, itemIdx) => {
              const isLast =
                groupIdx === lastGroupIdx &&
                itemIdx  === group.items.length - 1;

              return (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  isLast={isLast}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
