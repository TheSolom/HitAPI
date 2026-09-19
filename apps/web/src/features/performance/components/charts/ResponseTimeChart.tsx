import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import type { GetPerformanceOptions } from '@hitapi/types';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { LoadingCards } from '@/components/states/LoadingState';
import { useResponseTimeChartQuery } from '../../hooks';
import { transformResponseTimeChartData } from './chart.utils';
import { PerformanceChartEmptyState } from './PerformanceChartEmptyState';
import { formatResponseTime } from '../../utils';

export interface ResponseTimeChartProps {
    options: Partial<GetPerformanceOptions>;
}

export function ResponseTimeChart({
    options,
}: Readonly<ResponseTimeChartProps>) {
    const { data: rawData, isLoading } = useResponseTimeChartQuery(options);

    const chartData = useMemo(
        () => transformResponseTimeChartData(rawData),
        [rawData],
    );

    const stats = useMemo(() => {
        if (chartData.length === 0) return { avgP50: 0, avgP95: 0 };
        const validP50 = chartData.filter((p) => p.p50 !== null);
        const validP95 = chartData.filter((p) => p.p95 !== null);

        const sumP50 = validP50.reduce((acc, curr) => acc + (curr.p50 ?? 0), 0);
        const sumP95 = validP95.reduce((acc, curr) => acc + (curr.p95 ?? 0), 0);

        return {
            avgP50: validP50.length ? Math.round(sumP50 / validP50.length) : 0,
            avgP95: validP95.length ? Math.round(sumP95 / validP95.length) : 0,
        };
    }, [chartData]);

    if (isLoading) {
        return <LoadingCards count={1} />;
    }

    const hasData = chartData.length > 0;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between border-b">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-semibold tracking-tight">
                            Response Time (Percentiles)
                        </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        P50 (median), P75, and P95 latency distribution over
                        time
                    </CardDescription>
                </div>

                {hasData && (
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground tabular-nums">
                        <span>
                            Avg P50:{' '}
                            <strong className="text-foreground">
                                {formatResponseTime(stats.avgP50)}
                            </strong>
                        </span>
                        <span>·</span>
                        <span>
                            Avg P95:{' '}
                            <strong className="text-foreground">
                                {formatResponseTime(stats.avgP95)}
                            </strong>
                        </span>
                    </div>
                )}
            </CardHeader>

            <CardContent className="pt-4">
                {hasData ? (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -10,
                                    bottom: 0,
                                }}
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
                                    tickFormatter={(val: number) =>
                                        formatResponseTime(val)
                                    }
                                    className="text-muted-foreground font-mono"
                                />
                                <Tooltip
                                    formatter={(
                                        value: unknown,
                                        name?: unknown,
                                    ) => [
                                        formatResponseTime(
                                            typeof value === 'number'
                                                ? value
                                                : Number(value),
                                        ),
                                        typeof name === 'string' ? name : '',
                                    ]}
                                    contentStyle={{
                                        borderRadius: '0.75rem',
                                        borderColor: 'hsl(var(--border))',
                                        backgroundColor: 'hsl(var(--popover))',
                                        fontSize: '12px',
                                        boxShadow:
                                            '0 10px 15px -3px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Legend
                                    iconType="circle"
                                    wrapperStyle={{
                                        fontSize: '11px',
                                        paddingBottom: '8px',
                                        textAlign: 'right',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="p50"
                                    name="P50 (Median)"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={false}
                                    connectNulls
                                />
                                <Line
                                    type="monotone"
                                    dataKey="p75"
                                    name="P75"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    dot={false}
                                    connectNulls
                                />
                                <Line
                                    type="monotone"
                                    dataKey="p95"
                                    name="P95"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    dot={false}
                                    connectNulls
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <PerformanceChartEmptyState message="No response time data available for the selected period" />
                )}
            </CardContent>
        </Card>
    );
}
