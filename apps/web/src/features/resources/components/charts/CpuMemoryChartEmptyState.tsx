import { Cpu } from 'lucide-react';

export function CpuMemoryChartEmptyState() {
    return (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-8 text-center bg-muted/5">
            <Cpu className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <h4 className="text-sm font-medium text-foreground">
                No resource data available
            </h4>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Resource metrics will appear once your application instance
                sends telemetry data with the SDK.
            </p>
        </div>
    );
}
