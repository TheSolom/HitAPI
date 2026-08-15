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
    email: string;
    password: string;
    firstName: string;
    lastName: string;
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
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export interface SetPasswordPayload {
    newPassword: string;
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
