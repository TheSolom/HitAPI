import { formatNumber } from '../../utils';

interface CustomTooltipPayload {
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
    payload?: {
        statusCodes?: Record<number, number>;
    };
}

export interface RequestsChartTooltipProps {
    active?: boolean;
    payload?: readonly CustomTooltipPayload[];
    label?: string;
}

export function RequestsChartTooltip({
    active,
    payload,
    label,
}: Readonly<RequestsChartTooltipProps>) {
    if (!active || !payload || payload.length === 0) return null;

    const successful =
        payload.find((p) => p.dataKey === 'successful')?.value ?? 0;
    const clientError =
        payload.find((p) => p.dataKey === 'clientError')?.value ?? 0;
    const serverError =
        payload.find((p) => p.dataKey === 'serverError')?.value ?? 0;
    const total = successful + clientError + serverError;

    const statusCodes = payload[0]?.payload?.statusCodes ?? {};
    const codeEntries = Object.entries(statusCodes).sort(
        ([a], [b]) => Number(a) - Number(b),
    );

    return (
        <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-2.5 min-w-56">
            <div className="font-semibold text-foreground border-b pb-1.5 text-[11px] flex items-center justify-between">
                <span>{label}</span>
                <span className="text-muted-foreground font-normal">
                    {formatNumber(total)} requests
                </span>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                        <span className="text-muted-foreground font-medium">
                            Successful (2xx/3xx):
                        </span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                        <span>{formatNumber(successful)}</span>
                        {total > 0 && (
                            <span className="text-[10px] text-muted-foreground font-normal">
                                ({Math.round((successful / total) * 100)}%)
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm bg-amber-500" />
                        <span className="text-muted-foreground font-medium">
                            Client Error (4xx):
                        </span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                        <span>{formatNumber(clientError)}</span>
                        {total > 0 && (
                            <span className="text-[10px] text-muted-foreground font-normal">
                                ({Math.round((clientError / total) * 100)}%)
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm bg-rose-500" />
                        <span className="text-muted-foreground font-medium">
                            Server Error (5xx):
                        </span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                        <span>{formatNumber(serverError)}</span>
                        {total > 0 && (
                            <span className="text-[10px] text-muted-foreground font-normal">
                                ({Math.round((serverError / total) * 100)}%)
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {codeEntries.length > 0 && (
                <div className="border-t pt-2 space-y-1">
                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Status Codes
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {codeEntries.map(([code, count]) => {
                            const numCode = Number(code);
                            let badgeColor =
                                'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
                            if (numCode >= 500) {
                                badgeColor =
                                    'bg-rose-500/10 text-rose-600 border-rose-500/20';
                            } else if (numCode >= 400) {
                                badgeColor =
                                    'bg-amber-500/10 text-amber-600 border-amber-500/20';
                            }
                            return (
                                <span
                                    key={code}
                                    className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono ${badgeColor}`}
                                >
                                    <span>{code}:</span>
                                    <span className="font-semibold">
                                        {count}
                                    </span>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
