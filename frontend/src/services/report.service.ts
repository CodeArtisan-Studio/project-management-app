import { apiGet } from './api';
import type {
  SummaryReport,
  CompletionRateReport,
  ActivityDataPoint,
  ProjectTaskBreakdown,
  AssigneeTaskBreakdown,
  GetActivityOverTimeQuery,
  GetTasksByProjectQuery,
  GetTasksByAssigneeQuery,
  GetCompletionRateQuery,
} from '@/features/report/types/report.types';

export const reportService = {
  getSummary(): Promise<SummaryReport> {
    return apiGet<SummaryReport>('/reports/summary');
  },

  getCompletionRate(params?: GetCompletionRateQuery): Promise<CompletionRateReport> {
    return apiGet<CompletionRateReport>('/reports/completion-rate', { params });
  },

  getActivityOverTime(params?: GetActivityOverTimeQuery): Promise<ActivityDataPoint[]> {
    return apiGet<ActivityDataPoint[]>('/reports/activity-over-time', { params });
  },

  getTasksByProject(params?: GetTasksByProjectQuery): Promise<ProjectTaskBreakdown[]> {
    return apiGet<ProjectTaskBreakdown[]>('/reports/tasks-by-project', { params });
  },

  getTasksByAssignee(params?: GetTasksByAssigneeQuery): Promise<AssigneeTaskBreakdown[]> {
    return apiGet<AssigneeTaskBreakdown[]>('/reports/tasks-by-assignee', { params });
  },
};
