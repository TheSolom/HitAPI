export interface AuthTokens {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    refresh_token_expires_in: number;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegistrationPayload {
    displayName: string;
    email: string;
    password: string;
}

export interface VerifyEmailPayload {
    token: string;
}

export interface ResendVerificationPayload {
    email: string;
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface SetPasswordPayload {
    newPassword: string;
    confirmPassword: string;
}

export interface RefreshTokenPayload {
    refreshToken: string;
}

export interface LogoutPayload {
    refreshToken: string;
}

export interface UserProfile {
    id: string;
    displayName: string;
    email: string;
    isAdmin: boolean;
    isVerified: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface UserSession {
    id: string;
    deviceInfo?: string;
    ipAddress?: string;
    lastUsedAt?: string | Date;
    createdAt: string | Date;
}

export interface SocialAccount {
    provider: string;
    socialId: string;
    email: string;
    displayName: string;
    createdAt: string | Date;
}

export interface SocialLoginPayload {
    socialId: string;
    displayName: string;
    email: string;
    isVerified: boolean;
}

export interface TokenExchangePayload {
    grant_type: string;
    code: string;
    client_id?: string;
    client_secret: string;
    redirect_uri: string;
}

