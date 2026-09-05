import { Activity } from 'lucide-react';

export function ConsumersChartEmptyState() {
    return (
        <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed text-center text-xs text-muted-foreground">
            <Activity className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="font-medium text-foreground">
                No active consumer traffic recorded
            </p>
            <p className="text-[11px] mt-0.5">
                Incoming requests identified with client headers or SDK will
                appear in this timeline.
            </p>
        </div>
    );
}
