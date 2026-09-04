import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import type { SocialAccount } from '@hitapi/types';
import { authApi } from '../api';
import { authKeys } from './auth.keys';

export function useSocialAccountsQuery() {
    const token = useAuthStore((s) => s.token);

    return useQuery<SocialAccount[]>({
        queryKey: authKeys.socialAccounts(),
        queryFn: async () => {
            const res = await authApi.getSocialAccounts();
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: Boolean(token),
    });
}

export function useUnlinkSocialAccountMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (provider: string) => authApi.unlinkSocialAccount(provider),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: authKeys.socialAccounts(),
            });
            toast.success('Account unlinked successfully');
        },
        onError: () => {
            toast.error('Failed to unlink account');
        },
    });
}
