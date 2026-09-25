import { Activity } from 'lucide-react';

export function RequestLogsTimelineEmptyState() {
    return (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/10 p-6 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
                <Activity className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">
                No timeline activity
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
                No request log events match your active filters or time period.
            </p>
        </div>
    );
}
