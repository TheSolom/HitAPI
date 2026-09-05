interface CustomTooltipPayload {
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
}

export interface ConsumersChartTooltipProps {
    readonly active?: boolean;
    readonly payload?: readonly CustomTooltipPayload[];
    readonly label?: string;
}

export function ConsumersChartTooltip({
    active,
    payload,
    label,
}: ConsumersChartTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;

    const newCount = payload.find((p) => p.dataKey === 'New')?.value ?? 0;
    const existingCount =
        payload.find((p) => p.dataKey === 'Existing')?.value ?? 0;
    const total = newCount + existingCount;

    return (
        <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-2 min-w-47.5">
            <div className="font-semibold text-foreground border-b pb-1.5 text-[11px] flex items-center justify-between">
                <span>{label}</span>
                <span className="text-muted-foreground font-normal">
                    {total} active
                </span>
            </div>
            <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs" />
                        <span className="text-muted-foreground font-medium">
                            New Clients:
                        </span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                        <span>{newCount}</span>
                        {total > 0 && (
                            <span className="text-[10px] text-muted-foreground font-normal">
                                ({Math.round((newCount / total) * 100)}%)
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-violet-500 shadow-xs" />
                        <span className="text-muted-foreground font-medium">
                            Existing:
                        </span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                        <span>{existingCount}</span>
                        {total > 0 && (
                            <span className="text-[10px] text-muted-foreground font-normal">
                                ({Math.round((existingCount / total) * 100)}%)
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
