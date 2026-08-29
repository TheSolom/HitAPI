import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { ApiError } from '@/lib/api/types';
import type { UserProfile } from '@hitapi/types';
import { authApi } from '../api';
import { authKeys } from './auth.keys';

export function useCurrentUserQuery() {
    const token = useAuthStore((s) => s.token);
    const setUser = useAuthStore((s) => s.setUser);

    return useQuery<UserProfile | null>({
        queryKey: authKeys.currentUser(),
        queryFn: async ({ signal }) => {
            const res = await authApi.getCurrentUser(signal);
            const user = res.data ?? null;
            if (user) {
                setUser(user);
            }
            return user;
        },
        enabled: Boolean(token),
        retry: (failureCount, error) =>
            !(error instanceof ApiError && error.isUnauthorized) &&
            failureCount < 2,
    });
}
