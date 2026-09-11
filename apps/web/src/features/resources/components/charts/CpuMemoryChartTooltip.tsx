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
        <div className="rounded-md border border-border bg-popover p-3 text-xs space-y-2 min-w-48 shadow-sm">
            <div className="font-medium text-foreground border-b pb-1.5 text-[11px]">
                {label}
            </div>

            {(cpuAvg !== undefined || cpuMax !== undefined) && (
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                        <Cpu className="h-3 w-3" />
                        <span>CPU</span>
                    </div>
                    <div className="pl-4 space-y-0.5 text-muted-foreground text-[11px]">
                        {cpuAvg !== undefined && (
                            <div className="flex justify-between gap-4">
                                <span>Avg</span>
                                <span className="font-medium text-foreground tabular-nums">
                                    {formatCpuPercent(cpuAvg)}
                                </span>
                            </div>
                        )}
                        {cpuMin !== undefined && (
                            <div className="flex justify-between gap-4">
                                <span>Min</span>
                                <span className="text-foreground tabular-nums">
                                    {formatCpuPercent(cpuMin)}
                                </span>
                            </div>
                        )}
                        {cpuMax !== undefined && (
                            <div className="flex justify-between gap-4">
                                <span>Max</span>
                                <span className="text-foreground tabular-nums">
                                    {formatCpuPercent(cpuMax)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {(memAvgBytes !== undefined || memMaxBytes !== undefined) && (
                <div className="space-y-1 pt-1 border-t border-border/50">
                    <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                        <HardDrive className="h-3 w-3" />
                        <span>Memory RSS</span>
                    </div>
                    <div className="pl-4 space-y-0.5 text-muted-foreground text-[11px]">
                        {memAvgBytes !== undefined && (
                            <div className="flex justify-between gap-4">
                                <span>Avg</span>
                                <span className="font-medium text-foreground tabular-nums">
                                    {formatBytes(memAvgBytes)}
                                </span>
                            </div>
                        )}
                        {memMinBytes !== undefined && (
                            <div className="flex justify-between gap-4">
                                <span>Min</span>
                                <span className="text-foreground tabular-nums">
                                    {formatBytes(memMinBytes)}
                                </span>
                            </div>
                        )}
                        {memMaxBytes !== undefined && (
                            <div className="flex justify-between gap-4">
                                <span>Max</span>
                                <span className="text-foreground tabular-nums">
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
