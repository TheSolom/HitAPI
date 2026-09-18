import { BarChart3 } from 'lucide-react';

export function RequestsChartEmptyState() {
    return (
        <div className="flex h-56 flex-col items-center justify-center rounded-md border border-dashed text-center text-xs text-muted-foreground">
            <BarChart3 className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="font-medium text-foreground">
                No request traffic recorded
            </p>
            <p className="text-[11px] mt-0.5">
                Incoming requests to your API endpoints will be displayed here
                in real-time.
            </p>
        </div>
    );
}
