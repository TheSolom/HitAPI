import { useResourceMetricsQuery } from '../../hooks';
import { formatBytes, formatCpuPercent } from '../../utils';

export interface ResourceMetricsCardsProps {
    readonly appId: string;
}

export function ResourceMetricsCards({ appId }: ResourceMetricsCardsProps) {
    const { data: metrics, isLoading } = useResourceMetricsQuery(appId);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 rounded-md border border-border/60 bg-muted/20 px-4 py-3 divide-y sm:divide-y-0 sm:divide-x divide-border/60 animate-pulse">
                <div className="space-y-1.5 pb-2.5 sm:pb-0 sm:pr-6">
                    <div className="h-3 w-20 rounded bg-muted" />
                    <div className="h-5 w-36 rounded bg-muted" />
                </div>
                <div className="space-y-1.5 pt-2.5 sm:pt-0 sm:pl-6">
                    <div className="h-3 w-24 rounded bg-muted" />
                    <div className="h-5 w-40 rounded bg-muted" />
                </div>
            </div>
        );
    }

    const cpuAvg = metrics?.cpuPercentAvg ?? 0;
    const cpuMax = metrics?.cpuPercentMax ?? 0;
    const memAvg = metrics?.memoryRssAvg ?? 0;
    const memMax = metrics?.memoryRssMax ?? 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 rounded-md border border-border/60 bg-muted/20 px-4 py-3 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
            {/* CPU Usage */}
            <div className="space-y-0.5 pb-3 sm:pb-0 sm:pr-6">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    CPU Usage
                </div>
                <div className="text-sm font-semibold tabular-nums text-foreground">
                    <span>{formatCpuPercent(cpuAvg)}</span>
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                        avg
                    </span>
                    <span className="mx-2 text-muted-foreground/40 font-normal">
                        ·
                    </span>
                    <span>{formatCpuPercent(cpuMax)}</span>
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                        peak
                    </span>
                </div>
            </div>

            {/* Memory RSS */}
            <div className="space-y-0.5 pt-3 sm:pt-0 sm:pl-6">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Memory RSS
                </div>
                <div className="text-sm font-semibold tabular-nums text-foreground">
                    <span>{formatBytes(memAvg)}</span>
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                        avg
                    </span>
                    <span className="mx-2 text-muted-foreground/40 font-normal">
                        ·
                    </span>
                    <span>{formatBytes(memMax)}</span>
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                        peak
                    </span>
                </div>
            </div>
        </div>
    );
}

// Semantic alias export
export { ResourceMetricsCards as ResourceSummary };
