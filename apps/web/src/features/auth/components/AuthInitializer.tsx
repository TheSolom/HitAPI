import type { ReactNode } from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthInit } from '../hooks/use-auth-init';

interface AuthInitializerProps {
    readonly children: ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
    const { isInitializing, serverError, isRetrying, retry } = useAuthInit();

    if (serverError) {
        return (
            <div
                className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-center"
                role="alert"
                aria-live="assertive"
            >
                <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border bg-card p-8 shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <CloudOff className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="space-y-1.5">
                        <h2 className="text-lg font-semibold text-foreground">
                            Unable to Connect
                        </h2>
                        <p className="text-xs text-muted-foreground max-w-xs">
                            We're having trouble reaching the service. Please check your internet connection and try again.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            void retry();
                        }}
                        disabled={isRetrying}
                        className="gap-2 mt-2"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`}
                            aria-hidden="true"
                        />
                        <span>{isRetrying ? 'Connecting...' : 'Try Again'}</span>
                    </Button>
                </div>
            </div>
        );
    }

    if (isInitializing) {
        return (
            <div
                className="flex min-h-screen w-full items-center justify-center bg-background"
                aria-busy="true"
                aria-label="Initializing authentication"
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground animate-pulse">
                        Authenticating...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
