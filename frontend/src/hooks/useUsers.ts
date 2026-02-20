import { useQuery } from '@tanstack/react-query';
import { userService, type GetUsersQuery } from '@/services/user.service';
import { QUERY_KEYS } from '@/constants/query-keys';

/**
 * Fetches the user list (admin-only endpoint).
 * Fails gracefully for non-admin users — callers should handle isError.
 */
export function useUsers(params?: GetUsersQuery, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.users.list(params as Record<string, unknown>),
    queryFn: () => userService.getUsers(params),
    enabled,
    retry: false,
  });
}
