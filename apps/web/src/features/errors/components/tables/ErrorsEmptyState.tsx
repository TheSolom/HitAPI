import { ShieldCheck } from 'lucide-react';

interface ErrorsEmptyStateProps {
    readonly title?: string;
    readonly description?: string;
}

export function ErrorsEmptyState({
    title = 'No errors detected',
    description = 'No matching error records were found for the current query and filters.',
}: ErrorsEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
                <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                {description}
            </p>
        </div>
    );
}
