import { formatBytes } from '../../utils';

interface CustomTooltipPayload {
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
}

export interface DataTransferredChartTooltipProps {
    active?: boolean;
    payload?: readonly CustomTooltipPayload[];
    label?: string;
}

export function DataTransferredChartTooltip({
    active,
    payload,
    label,
}: Readonly<DataTransferredChartTooltipProps>) {
    if (!active || !payload || payload.length === 0) return null;

    const requestBytes =
        payload.find((p) => p.dataKey === 'requestBytes')?.value ?? 0;
    const responseBytes =
        payload.find((p) => p.dataKey === 'responseBytes')?.value ?? 0;
    const total = requestBytes + responseBytes;

    return (
        <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-2.5 min-w-52">
            <div className="font-semibold text-foreground border-b pb-1.5 text-[11px] flex items-center justify-between">
                <span>{label}</span>
                <span className="text-muted-foreground font-normal">
                    {formatBytes(total)} total
                </span>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm bg-[#8b5cf6]" />
                        <span className="text-muted-foreground font-medium">
                            Request (Inbound):
                        </span>
                    </div>
                    <span className="font-semibold text-foreground tabular-nums">
                        {formatBytes(requestBytes)}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm bg-[#06b6d4]" />
                        <span className="text-muted-foreground font-medium">
                            Response (Outbound):
                        </span>
                    </div>
                    <span className="font-semibold text-foreground tabular-nums">
                        {formatBytes(responseBytes)}
                    </span>
                </div>
            </div>
        </div>
    );
}
