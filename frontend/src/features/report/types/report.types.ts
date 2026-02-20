// ─── Report API response types ────────────────────────────
// Mirrors backend src/modules/report/report.repository.ts

export interface TaskStatusCount {
  statusName: string;
  count:      number;
}

export interface SummaryReport {
  totalProjects:          number;
  totalTasks:             number;
  tasksByStatus:          TaskStatusCount[];
  tasksCompletedThisWeek: number;
  tasksCreatedLast30Days: number;
}

export interface CompletionRateReport {
  totalTasks:     number;
  completedTasks: number;
  completionRate: number; // 0–100, 2 decimal places
}

export interface ActivityDataPoint {
  date:  string; // YYYY-MM-DD
  count: number;
}

export interface ProjectTaskBreakdown {
  projectId:   string;
  projectName: string;
  total:       number;
  byStatus:    TaskStatusCount[];
}

export interface AssigneeTaskBreakdown {
  assigneeId:   string | null; // null = unassigned tasks
  assigneeName: string | null; // null = unassigned tasks
  total:        number;
  byStatus:     TaskStatusCount[];
}

// ─── Query param types ────────────────────────────────────

export interface GetActivityOverTimeQuery {
  from?:        string; // ISO 8601
  to?:          string;
  projectId?:   string;
  granularity?: 'day' | 'week';
}

export interface GetTasksByProjectQuery {
  from?:      string;
  to?:        string;
  projectId?: string;
}

export interface GetTasksByAssigneeQuery {
  from?:      string;
  to?:        string;
  projectId?: string;
}

export interface GetCompletionRateQuery {
  from?:      string;
  to?:        string;
  projectId?: string;
}
