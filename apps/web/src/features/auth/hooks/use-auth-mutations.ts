import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import type {
    AuthTokens,
    ChangePasswordPayload,
    ForgotPasswordPayload,
    LoginPayload,
    RefreshTokenPayload,
    RegistrationPayload,
    ResendVerificationPayload,
    ResetPasswordPayload,
    SetPasswordPayload,
    UserProfile,
    VerifyEmailPayload,
} from '@hitapi/types';
import { authApi } from '../api';
import { authKeys } from './auth.keys';

export function useLoginMutation() {
    const setTokens = useAuthStore((s) => s.setTokens);
    const setUser = useAuthStore((s) => s.setUser);
    const queryClient = useQueryClient();

    return useMutation<
        { tokens: AuthTokens; user: UserProfile | null },
        Error,
        LoginPayload
    >({
        mutationFn: async (payload: LoginPayload) => {
            const tokens = await authApi.login(payload);
            setTokens(tokens);

            const userRes = await authApi.getCurrentUser();
            const user = userRes.data ?? null;
            if (user) {
                setUser(user);
            }

            return { tokens, user };
        },
        onSuccess: ({ user }) => {
            if (user) {
                queryClient.setQueryData(authKeys.currentUser(), user);
            }
            const name = user?.displayName ?? 'there';
            toast.success(`Welcome back, ${name}`);
        },
    });
}

export function useRegisterMutation() {
    return useMutation({
        mutationFn: (payload: RegistrationPayload) => authApi.register(payload),
        onSuccess: (res) => {
            toast.success(
                res.data?.message ??
                    'Account created. Check your inbox to verify your email.',
            );
        },
    });
}

export function useLogout() {
    const logout = useAuthStore((s) => s.logout);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            try {
                await authApi.logout();
            } catch {
                // Local logout must proceed even if remote revocation fails
            }
        },
        onSettled: () => {
            logout();
            queryClient.clear();
        },
    });
}

export function useLogoutAll() {
    const logout = useAuthStore((s) => s.logout);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            try {
                await authApi.logoutAll();
            } catch {
                // Local logout must proceed even if remote revocation fails
            }
        },
        onSettled: () => {
            logout();
            queryClient.clear();
        },
    });
}

export function useChangePasswordMutation() {
    return useMutation({
        mutationFn: (payload: ChangePasswordPayload) =>
            authApi.changePassword(payload),
        onSuccess: (res) => {
            toast.success(res.data?.message ?? 'Password changed successfully');
        },
    });
}

export function useSetPasswordMutation() {
    return useMutation({
        mutationFn: (payload: SetPasswordPayload) =>
            authApi.setPassword(payload),
        onSuccess: (res) => {
            toast.success(res.data?.message ?? 'Password set successfully');
        },
    });
}

export function useForgotPasswordMutation() {
    return useMutation({
        mutationFn: (payload: ForgotPasswordPayload) =>
            authApi.forgotPassword(payload),
        onSuccess: (res) => {
            toast.success(
                res.data?.message ??
                    'If that email exists, a reset link is on its way.',
            );
        },
    });
}

export const useRequestPasswordResetMutation = useForgotPasswordMutation;

export function useResetPasswordMutation() {
    return useMutation({
        mutationFn: (payload: ResetPasswordPayload) =>
            authApi.resetPassword(payload),
        onSuccess: (res) => {
            toast.success(
                res.data?.message ??
                    'Password reset successfully. You can sign in now.',
            );
        },
    });
}

export function useVerifyEmailMutation() {
    const setTokens = useAuthStore((s) => s.setTokens);
    const setUser = useAuthStore((s) => s.setUser);

    return useMutation<
        { tokens: AuthTokens; user: UserProfile | null },
        Error,
        VerifyEmailPayload
    >({
        mutationFn: async (payload: VerifyEmailPayload) => {
            const tokens = await authApi.verifyEmail(payload);
            setTokens(tokens);

            const userRes = await authApi.getCurrentUser();
            const user = userRes.data ?? null;
            if (user) {
                setUser(user);
            }

            return { tokens, user };
        },
    });
}

export function useRefreshTokenMutation() {
    const setTokens = useAuthStore((s) => s.setTokens);

    return useMutation({
        mutationFn: async (payload?: RefreshTokenPayload) => {
            const tokens = await authApi.refreshToken(payload);
            setTokens(tokens);
            return tokens;
        },
    });
}

export function useResendVerificationMutation() {
    return useMutation({
        mutationFn: (payload: ResendVerificationPayload) =>
            authApi.resendVerificationEmail(payload),
        onSuccess: (res) => {
            toast.success(
                res.data?.message ?? 'Verification email sent successfully',
            );
        },
    });
}

export function useDeleteAccountMutation() {
    const logout = useAuthStore((s) => s.logout);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await authApi.deleteCurrentUser();
        },
        onSuccess: () => {
            toast.success('Your account has been deleted successfully.');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete account.');
        },
        onSettled: () => {
            logout();
            queryClient.clear();
        },
    });
}
