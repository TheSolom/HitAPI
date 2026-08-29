import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/types';

interface ErrorStateProps {
    error: unknown;
    onRetry?: () => void;
    title?: string;
}

export function ErrorState({
    error,
    onRetry,
    title = "Couldn't load this data",
}: Readonly<ErrorStateProps>) {
    let message: string;

    if (error instanceof ApiError) {
        if (error.status === 0) {
            message =
                'The HitAPI backend is unreachable. Confirm VITE_API_BASE_URL points at your running NestJS server.';
        } else {
            message = error.message;
        }
    } else if (error instanceof Error) {
        message = error.message;
    } else {
        message = 'Unexpected error';
    }

    return (
        <div
            role="alert"
            className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-8 text-center"
        >
            <AlertTriangle
                className="h-6 w-6 text-destructive"
                aria-hidden="true"
            />
            <div>
                <p className="font-medium text-foreground">{title}</p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    {message}
                </p>
            </div>
            {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                    <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                    Try again
                </Button>
            )}
        </div>
    );
}
