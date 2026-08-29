import { api } from '@/lib/api/client';
import type {
    AuthTokens,
    LoginPayload,
    RegistrationPayload,
    VerifyEmailPayload,
    ResendVerificationPayload,
    ForgotPasswordPayload,
    ResetPasswordPayload,
    ChangePasswordPayload,
    SetPasswordPayload,
    RefreshTokenPayload,
    LogoutPayload,
    UserProfile,
    UserSession,
    SocialAccount,
    CustomResponse,
    MessageResponse,
} from '@hitapi/types';

export const authApi = {
    login: (payload: LoginPayload) =>
        api.post<AuthTokens>('/auth/login', payload, { anonymous: true }),

    register: (payload: RegistrationPayload) =>
        api.post<CustomResponse<MessageResponse>>('/auth/register', payload, {
            anonymous: true,
        }),

    verifyEmail: (payload: VerifyEmailPayload) =>
        api.post<AuthTokens>('/auth/verify-email', payload, {
            anonymous: true,
        }),

    resendVerificationEmail: (payload: ResendVerificationPayload) =>
        api.post<CustomResponse<MessageResponse>>(
            '/auth/resend-verification',
            payload,
        ),

    forgotPassword: (payload: ForgotPasswordPayload) =>
        api.post<CustomResponse<MessageResponse>>(
            '/auth/forgot-password',
            payload,
            { anonymous: true },
        ),

    resetPassword: (payload: ResetPasswordPayload) =>
        api.post<CustomResponse<MessageResponse>>(
            '/auth/reset-password',
            payload,
            { anonymous: true },
        ),

    changePassword: (payload: ChangePasswordPayload) =>
        api.patch<CustomResponse<MessageResponse>>(
            '/auth/change-password',
            payload,
        ),

    setPassword: (payload: SetPasswordPayload) =>
        api.patch<CustomResponse<MessageResponse>>(
            '/auth/set-password',
            payload,
        ),

    logout: (payload?: LogoutPayload) =>
        api.post<undefined>('/auth/logout', payload),

    logoutAll: () => api.post<undefined>('/auth/logout-all'),

    refreshToken: (payload?: RefreshTokenPayload) =>
        api.post<AuthTokens>('/auth/refresh', payload),

    getCurrentUser: (signal?: AbortSignal) =>
        api.get<CustomResponse<UserProfile>>('/users/me', undefined, signal),

    deleteCurrentUser: () => api.delete<undefined>('/users/me'),

    getActiveSessions: () =>
        api.get<CustomResponse<UserSession[]>>('/auth/sessions'),

    revokeSession: (sessionId: string) =>
        api.post<undefined>(`/auth/sessions/${sessionId}/revoke`),

    getSocialAccounts: () =>
        api.get<CustomResponse<SocialAccount[]>>('/users/me/social-accounts'),

    unlinkSocialAccount: (provider: string) =>
        api.delete<undefined>(`/auth/social-accounts/${provider}`),
};
