import { create } from 'zustand';
import type { UserProfile, AuthTokens } from '@hitapi/types';

export type AuthUser = UserProfile;

interface AuthState {
    token: string | null;
    user: UserProfile | null;
    isInitializing: boolean;
    setTokens: (tokens: AuthTokens) => void;
    setAccessToken: (token: string | null) => void;
    setSession: (token: string, user: UserProfile | null) => void;
    setUser: (user: UserProfile | null) => void;
    setInitializing: (isInitializing: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isInitializing: true,
    setTokens: (tokens) => {
        set({ token: tokens.access_token });
    },
    setAccessToken: (token) => {
        set({ token });
    },
    setSession: (token, user) => {
        set({ token, user });
    },
    setUser: (user) => {
        set({ user });
    },
    setInitializing: (isInitializing) => {
        set({ isInitializing });
    },
    logout: () => {
        set({ token: null, user: null, isInitializing: false });
    },
}));

export const getAuthToken = (): string | null => useAuthStore.getState().token;
