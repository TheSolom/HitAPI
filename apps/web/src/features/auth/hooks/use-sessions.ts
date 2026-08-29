import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import type { UserSession } from '@hitapi/types';
import { authApi } from '../api';
import { authKeys } from './auth.keys';

export function useActiveSessionsQuery() {
    const token = useAuthStore((s) => s.token);

    return useQuery<UserSession[]>({
        queryKey: authKeys.sessions(),
        queryFn: async () => {
            const res = await authApi.getActiveSessions();
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: Boolean(token),
    });
}

export function useRevokeSessionMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sessionId: string) => authApi.revokeSession(sessionId),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: authKeys.sessions(),
            });
            toast.success('Session revoked');
        },
        onError: () => {
            toast.error('Failed to revoke session');
        },
    });
}
