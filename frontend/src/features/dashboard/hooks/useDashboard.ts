import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { QUERY_KEYS } from '@/constants/query-keys';

export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.stats(),
    queryFn: () => dashboardService.getStats(),
  });
}
