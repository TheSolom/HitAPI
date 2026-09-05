import { Cpu, HardDrive } from 'lucide-react';
import { formatBytes, formatCpuPercent } from '../../utils';

export interface CustomTooltipPayload {
    name?: string;
    value?: number | null;
    color?: string;
    dataKey?: string;
}

export interface CpuMemoryChartTooltipProps {
    readonly active?: boolean;
    readonly payload?: readonly CustomTooltipPayload[];
    readonly label?: string;
}

export function CpuMemoryChartTooltip({
    active,
    payload,
    label,
}: CpuMemoryChartTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;

    const cpuAvg = payload.find((p) => p.dataKey === 'cpuAvg')?.value;
    const cpuMin = payload.find((p) => p.dataKey === 'cpuMin')?.value;
    const cpuMax = payload.find((p) => p.dataKey === 'cpuMax')?.value;
    const memAvgBytes = payload.find((p) => p.dataKey === 'memAvgBytes')?.value;
    const memMinBytes = payload.find((p) => p.dataKey === 'memMinBytes')?.value;
    const memMaxBytes = payload.find((p) => p.dataKey === 'memMaxBytes')?.value;

    return (
        <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-2 min-w-52.5">
            <div className="font-semibold text-foreground border-b pb-1.5 text-[11px]">
                {label}
            </div>

            {/* CPU Metrics Section */}
            {(cpuAvg !== undefined || cpuMax !== undefined) && (
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-sky-500">
                        <Cpu className="h-3.5 w-3.5" />
                        <span>CPU Usage</span>
                    </div>
                    <div className="pl-5 space-y-0.5 text-muted-foreground text-[11px]">
                        {cpuAvg !== undefined && (
                            <div className="flex justify-between">
                                <span>Average:</span>
                                <span className="font-semibold text-foreground">
                                    {formatCpuPercent(cpuAvg)}
                                </span>
                            </div>
                        )}
                        {cpuMin !== undefined && (
                            <div className="flex justify-between">
                                <span>Minimum:</span>
                                <span className="font-medium text-foreground">
                                    {formatCpuPercent(cpuMin)}
                                </span>
                            </div>
                        )}
                        {cpuMax !== undefined && (
                            <div className="flex justify-between">
                                <span>Maximum:</span>
                                <span className="font-medium text-foreground">
                                    {formatCpuPercent(cpuMax)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Memory Metrics Section */}
            {(memAvgBytes !== undefined || memMaxBytes !== undefined) && (
                <div className="space-y-1 pt-1 border-t border-border/50">
                    <div className="flex items-center gap-1.5 font-medium text-violet-500">
                        <HardDrive className="h-3.5 w-3.5" />
                        <span>Memory RSS</span>
                    </div>
                    <div className="pl-5 space-y-0.5 text-muted-foreground text-[11px]">
                        {memAvgBytes !== undefined && (
                            <div className="flex justify-between">
                                <span>Average:</span>
                                <span className="font-semibold text-foreground">
                                    {formatBytes(memAvgBytes)}
                                </span>
                            </div>
                        )}
                        {memMinBytes !== undefined && (
                            <div className="flex justify-between">
                                <span>Minimum:</span>
                                <span className="font-medium text-foreground">
                                    {formatBytes(memMinBytes)}
                                </span>
                            </div>
                        )}
                        {memMaxBytes !== undefined && (
                            <div className="flex justify-between">
                                <span>Maximum:</span>
                                <span className="font-medium text-foreground">
                                    {formatBytes(memMaxBytes)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
