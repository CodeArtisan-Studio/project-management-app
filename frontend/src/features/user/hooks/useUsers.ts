import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import type { GetUsersQuery, UpdateProfilePayload } from '@/services/user.service';

export function useUsers(params?: GetUsersQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.users.list(params as Record<string, unknown>),
    queryFn: () => userService.getUsers(params),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userService.updateMe(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.me() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.lists() });
    },
  });
}
