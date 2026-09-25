import { formatNumber } from '@/lib/format';

interface CustomTooltipPayload {
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
}

export interface RequestLogsTimelineChartTooltipProps {
    active?: boolean;
    payload?: readonly CustomTooltipPayload[];
    label?: string;
}

export function RequestLogsTimelineChartTooltip({
    active,
    payload,
    label,
}: Readonly<RequestLogsTimelineChartTooltipProps>) {
    if (!active || !payload || payload.length === 0) return null;

    const count = payload[0]?.value ?? 0;

    return (
        <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-2.5 min-w-48">
            <div className="font-semibold text-foreground border-b pb-1.5 text-[11px] flex items-center justify-between">
                <span>{label}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">Requests</span>
                </div>
                <span className="font-semibold font-mono text-foreground">
                    {formatNumber(count)}
                </span>
            </div>
        </div>
    );
}
