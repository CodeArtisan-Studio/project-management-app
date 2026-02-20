// ─── Action Enum ──────────────────────────────────────────
export type ActivityAction =
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_ARCHIVED'
  | 'PROJECT_COMPLETED'
  | 'PROJECT_DELETED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_ASSIGNED'
  | 'TASK_UNASSIGNED'
  | 'TASK_DELETED'
  | 'STATUS_CREATED'
  | 'STATUS_UPDATED'
  | 'STATUS_DELETED';

// ─── Embedded actor ───────────────────────────────────────
export interface ActivityUser {
  id:        string;
  firstName: string;
  lastName:  string;
  email:     string;
}

// ─── Activity record (matches backend ActivityRecord) ─────
export interface Activity {
  id:        string;
  projectId: string;
  userId:    string;
  action:    ActivityAction;
  metadata:  Record<string, unknown> | null;
  createdAt: string;
  user:      ActivityUser;
}

// ─── Query params ─────────────────────────────────────────
export interface GetActivitiesQuery {
  page?:      number;
  limit?:     number;
  action?:    ActivityAction;
  userId?:    string;
  from?:      string;
  to?:        string;
  sortOrder?: 'asc' | 'desc';
}
