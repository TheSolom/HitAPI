import { useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { silentRefreshToken } from '@/lib/api/client';
import { authApi } from '../api';

export function AuthCallbackPage() {
    const navigate = useNavigate();
    const setUser = useAuthStore((s) => s.setUser);
    const setInitializing = useAuthStore((s) => s.setInitializing);
    const didRun = useRef(false);

    useEffect(() => {
        if (didRun.current) return;
        didRun.current = true;

        async function processOAuthCallback() {
            try {
                if (typeof window !== 'undefined') {
                    const params = new URLSearchParams(window.location.search);
                    const errorParam =
                        params.get('error') || params.get('error_description');
                    if (errorParam) {
                        toast.error(
                            `Google authentication was cancelled or failed: ${errorParam}`,
                        );
                        setInitializing(false);
                        await navigate({ to: '/login' });
                        return;
                    }
                }

                const token = await silentRefreshToken();
                if (token) {
                    const userRes = await authApi.getCurrentUser();
                    const user = userRes.data ?? null;
                    if (user) {
                        setUser(user);
                    }
                    toast.success(
                        `Signed in as ${user?.displayName || user?.email || 'Google User'}`,
                    );
                    setInitializing(false);
                    await navigate({ to: '/apps' });
                } else {
                    toast.error(
                        'Google sign-in failed. Could not verify session.',
                    );
                    setInitializing(false);
                    await navigate({ to: '/login' });
                }
            } catch {
                toast.error('An error occurred during Google sign-in.');
                setInitializing(false);
                await navigate({ to: '/login' });
            }
        }

        void processOAuthCallback();
    }, [navigate, setInitializing, setUser]);

    return (
        <div
            className="flex min-h-screen w-full items-center justify-center bg-background"
            aria-busy="true"
            aria-label="Completing authentication"
        >
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground animate-pulse">
                    Completing authentication with Google...
                </p>
            </div>
        </div>
    );
}
