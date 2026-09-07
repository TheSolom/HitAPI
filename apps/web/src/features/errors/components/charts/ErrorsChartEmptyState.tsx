import type { LucideIcon } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';

interface ErrorsChartEmptyStateProps {
    readonly icon?: LucideIcon;
    readonly title?: string;
    readonly description?: string;
}

export function ErrorsChartEmptyState({
    icon: Icon = ShieldCheck,
    title = 'No Errors Recorded',
    description = 'All API requests completed successfully with 2xx/3xx status codes in the selected period.',
}: ErrorsChartEmptyStateProps) {
    return (
        <div className="flex h-64 flex-col items-center justify-center space-y-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Icon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                    {description}
                </p>
            </div>
        </div>
    );
}
