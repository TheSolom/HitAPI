import { BarChart2 } from 'lucide-react';

export interface PerformanceChartEmptyStateProps {
    message?: string;
}

export function PerformanceChartEmptyState({
    message = 'No performance data available for the selected period',
}: Readonly<PerformanceChartEmptyStateProps>) {
    return (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/20 text-center p-6">
            <BarChart2 className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-xs font-medium text-muted-foreground">
                {message}
            </p>
        </div>
    );
}
