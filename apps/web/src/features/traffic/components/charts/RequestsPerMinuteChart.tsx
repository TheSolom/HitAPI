import { useMemo } from 'react';
import { Gauge } from 'lucide-react';
import type { GetTrafficOptions } from '@hitapi/types';
import {
    Area,
    AreaChart,
    CartesianGrid,
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
import { useRequestsPerMinuteChartQuery } from '../../hooks';
import { transformRpmChartData } from './chart.utils';
import { RequestsChartEmptyState } from './RequestsChartEmptyState';

export interface RequestsPerMinuteChartProps {
    readonly options: Partial<GetTrafficOptions>;
}

export function RequestsPerMinuteChart({
    options,
}: RequestsPerMinuteChartProps) {
    const { data: rawData, isLoading } =
        useRequestsPerMinuteChartQuery(options);

    const chartData = useMemo(() => transformRpmChartData(rawData), [rawData]);

    const stats = useMemo(() => {
        if (chartData.length === 0) return { peak: 0, avg: 0 };
        let sum = 0;
        let peak = 0;
        for (const item of chartData) {
            sum += item.rpm;
            if (item.rpm > peak) peak = item.rpm;
        }
        return {
            peak,
            avg: Math.round((sum / chartData.length) * 100) / 100,
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
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-semibold tracking-tight">
                            Requests Per Minute (Throughput)
                        </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        Real-time incoming request throughput rate per minute
                    </CardDescription>
                </div>

                {hasData && (
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground tabular-nums">
                        <span>
                            Avg:{' '}
                            <strong className="text-foreground">
                                {stats.avg.toFixed(2)} RPM
                            </strong>
                        </span>
                        <span>·</span>
                        <span>
                            Peak:{' '}
                            <strong className="text-foreground">
                                {stats.peak.toFixed(2)} RPM
                            </strong>
                        </span>
                    </div>
                )}
            </CardHeader>

            <CardContent className="pt-4">
                {hasData ? (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -20,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="gradientRpm"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#3b82f6"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#3b82f6"
                                            stopOpacity={0.05}
                                        />
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
                                <Tooltip
                                    formatter={(value: unknown) => [
                                        `${typeof value === 'number' ? value.toFixed(2) : String(value)} RPM`,
                                        'Throughput',
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
                                <Area
                                    type="monotone"
                                    dataKey="rpm"
                                    name="Throughput"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="url(#gradientRpm)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <RequestsChartEmptyState />
                )}
            </CardContent>
        </Card>
    );
}
