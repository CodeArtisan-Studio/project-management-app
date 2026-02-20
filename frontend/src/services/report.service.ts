import { apiGet } from './api';
import type {
  SummaryReport,
  CompletionRateReport,
  ActivityDataPoint,
  GetActivityOverTimeQuery,
} from '@/features/report/types/report.types';

export const reportService = {
  getSummary(): Promise<SummaryReport> {
    return apiGet<SummaryReport>('/reports/summary');
  },

  getCompletionRate(params?: {
    projectId?: string;
    from?: string;
    to?: string;
  }): Promise<CompletionRateReport> {
    return apiGet<CompletionRateReport>('/reports/completion-rate', { params });
  },

  getActivityOverTime(params?: GetActivityOverTimeQuery): Promise<ActivityDataPoint[]> {
    return apiGet<ActivityDataPoint[]>('/reports/activity-over-time', { params });
  },
};
