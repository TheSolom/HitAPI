import { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    Activity,
    BarChart2,
    LineChart as LineChartIcon,
    Sparkles,
    TrendingUp,
    Users,
} from 'lucide-react';
import type { Period } from '@hitapi/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingCards } from '@/components/states/LoadingState';
import { useConsumersChartQuery } from '../../hooks';

interface ConsumersChartProps {
    readonly appId: string;
    readonly period?: Period;
    readonly consumerGroupId?: number;
    readonly consumerId?: number;
}

function formatTimeWindow(timeString: string): string {
    const date = new Date(timeString);
    if (Number.isNaN(date.getTime())) return timeString;

    return date.toLocaleTimeString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

interface CustomTooltipProps {
    readonly active?: boolean;
    readonly payload?: Array<{
        name?: string;
        value?: number;
        color?: string;
        dataKey?: string;
    }>;
    readonly label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;

    const newCount =
        payload.find((p) => p.dataKey === 'New')?.value ?? 0;
    const existingCount =
        payload.find((p) => p.dataKey === 'Existing')?.value ?? 0;
    const total = newCount + existingCount;

    return (
        <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-2 min-w-[190px]">
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
                        <span className="text-muted-foreground font-medium">New Clients:</span>
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
                        <span className="text-muted-foreground font-medium">Existing:</span>
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

export function ConsumersChart({
    appId,
    period,
    consumerGroupId,
    consumerId,
}: ConsumersChartProps) {
    const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

    const chartQuery = useConsumersChartQuery({
        appId,
        period,
        consumerGroupId,
        consumerId,
    });

    const datasets = chartQuery.data ?? [];

    const chartData = useMemo(() => {
        const timeMap = new Map<
            string,
            {
                timeWindow: string;
                formattedTime: string;
                New: number;
                Existing: number;
                Total: number;
            }
        >();

        for (const dataset of datasets) {
            const statusKey =
                dataset.consumer_status === 'New' ? 'New' : 'Existing';
            for (let i = 0; i < dataset.timeWindows.length; i++) {
                const tw = dataset.timeWindows[i];
                const count = dataset.consumerCounts[i] ?? 0;
                if (!timeMap.has(tw)) {
                    timeMap.set(tw, {
                        timeWindow: tw,
                        formattedTime: formatTimeWindow(tw),
                        New: 0,
                        Existing: 0,
                        Total: 0,
                    });
                }
                const entry = timeMap.get(tw);
                if (entry) {
                    entry[statusKey] = count;
                    entry.Total = entry.New + entry.Existing;
                }
            }
        }

        return Array.from(timeMap.values()).sort(
            (a, b) =>
                new Date(a.timeWindow).getTime() -
                new Date(b.timeWindow).getTime(),
        );
    }, [datasets]);

    const { totalNew, totalExisting, totalActive } = useMemo(() => {
        let n = 0;
        let e = 0;
        for (const item of chartData) {
            n += item.New;
            e += item.Existing;
        }
        return { totalNew: n, totalExisting: e, totalActive: n + e };
    }, [chartData]);

    if (chartQuery.isLoading) {
        return <LoadingCards count={1} />;
    }

    return (
        <Card className="overflow-hidden border-border/60 shadow-xs bg-linear-to-b from-card to-card/50">
            <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between border-b bg-muted/10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-semibold tracking-tight">
                            Active Consumer Trends
                        </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        Volume of unique active consumers making API requests across time windows
                    </CardDescription>
                </div>

                {chartData.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Summary Badges */}
                        <div className="flex items-center gap-1.5 bg-muted/40 rounded-lg p-1 border text-xs">
                            <Badge
                                variant="outline"
                                className="h-6 gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-semibold"
                            >
                                <Sparkles className="h-3 w-3" />
                                <span>{totalNew} New</span>
                            </Badge>
                            <Badge
                                variant="outline"
                                className="h-6 gap-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 text-[11px] font-semibold"
                            >
                                <Users className="h-3 w-3" />
                                <span>{totalExisting} Existing</span>
                            </Badge>
                        </div>

                        {/* Chart Type Toggle */}
                        <div className="flex items-center rounded-lg border bg-background p-0.5">
                            <Button
                                variant={chartType === 'bar' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                    setChartType('bar');
                                }}
                                title="Stacked Bar View"
                            >
                                <BarChart2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant={chartType === 'area' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                    setChartType('area');
                                }}
                                title="Area Trend View"
                            >
                                <LineChartIcon className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent className="pt-5">
                {chartData.length === 0 ? (
                    <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed text-center text-xs text-muted-foreground">
                        <Activity className="h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="font-medium text-foreground">No active consumer traffic recorded</p>
                        <p className="text-[11px] mt-0.5">Incoming requests identified with client headers or SDK will appear in this timeline.</p>
                    </div>
                ) : (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'bar' ? (
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-border/30"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="formattedTime"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 11 }}
                                        className="text-muted-foreground font-mono"
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 11 }}
                                        allowDecimals={false}
                                        className="text-muted-foreground font-mono"
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                                    />
                                    <Bar
                                        dataKey="Existing"
                                        name="Existing Clients"
                                        stackId="consumers"
                                        fill="#8b5cf6"
                                        radius={[0, 0, 3, 3]}
                                    />
                                    <Bar
                                        dataKey="New"
                                        name="New Clients"
                                        stackId="consumers"
                                        fill="#10b981"
                                        radius={[3, 3, 0, 0]}
                                    />
                                </BarChart>
                            ) : (
                                <AreaChart
                                    data={chartData}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="gradientNew" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                        </linearGradient>
                                        <linearGradient id="gradientExisting" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-border/30"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="formattedTime"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 11 }}
                                        className="text-muted-foreground font-mono"
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 11 }}
                                        allowDecimals={false}
                                        className="text-muted-foreground font-mono"
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Existing"
                                        name="Existing Clients"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#gradientExisting)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="New"
                                        name="New Clients"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#gradientNew)"
                                    />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
