import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { silentRefreshTokenDetails } from '@/lib/api/client';
import { authApi } from '../api';

export function useAuthInit() {
    const isInitializing = useAuthStore((s) => s.isInitializing);
    const setUser = useAuthStore((s) => s.setUser);
    const setInitializing = useAuthStore((s) => s.setInitializing);
    const logout = useAuthStore((s) => s.logout);
    const [serverError, setServerError] = useState<boolean>(false);
    const [isRetrying, setIsRetrying] = useState<boolean>(false);
    const didRun = useRef(false);

    const initAuth = useCallback(async () => {
        setServerError(false);
        setIsRetrying(true);
        try {
            const refreshResult = await silentRefreshTokenDetails();
            if (refreshResult.status === 'success') {
                const userRes = await authApi.getCurrentUser();
                const user = userRes.data ?? null;
                if (user) {
                    setUser(user);
                }
                setInitializing(false);
            } else if (refreshResult.status === 'network_error') {
                // Backend server is unreachable or offline
                setServerError(true);
            } else {
                // Genuinely unauthenticated (401/403/400)
                logout();
                setInitializing(false);
            }
        } catch {
            setServerError(true);
        } finally {
            setIsRetrying(false);
        }
    }, [logout, setInitializing, setUser]);

    useEffect(() => {
        if (didRun.current) return;
        didRun.current = true;
        void initAuth();
    }, [initAuth]);

    return {
        isInitializing,
        serverError,
        isRetrying,
        retry: initAuth,
    };
}

