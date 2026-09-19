import { useMemo } from 'react';
import { Award } from 'lucide-react';
import type { GetPerformanceOptions } from '@hitapi/types';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ReferenceLine,
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
import { useApdexScoreChartQuery } from '../../hooks';
import { transformApdexChartData } from './chart.utils';
import { PerformanceChartEmptyState } from './PerformanceChartEmptyState';
import { formatApdex, getApdexRating } from '../../utils';

export interface ApdexScoreChartProps {
    options: Partial<GetPerformanceOptions>;
}

export function ApdexScoreChart({ options }: Readonly<ApdexScoreChartProps>) {
    const { data: rawData, isLoading } = useApdexScoreChartQuery(options);

    const chartData = useMemo(
        () => transformApdexChartData(rawData),
        [rawData],
    );

    const stats = useMemo(() => {
        if (chartData.length === 0) return { avg: 0, latest: 0 };
        const validPoints = chartData.filter((p) => p.apdexScore !== null);
        if (validPoints.length === 0) return { avg: 0, latest: 0 };

        const sum = validPoints.reduce(
            (acc, curr) => acc + (curr.apdexScore ?? 0),
            0,
        );
        const latest = validPoints.at(-1)?.apdexScore ?? 0;
        return {
            avg: sum / validPoints.length,
            latest,
        };
    }, [chartData]);

    if (isLoading) {
        return <LoadingCards count={1} />;
    }

    const hasData = chartData.length > 0;
    const latestRating = getApdexRating(stats.latest);

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between border-b">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-semibold tracking-tight">
                            Apdex Score (User Satisfaction)
                        </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        Application Performance Index score over time (0.00 –
                        1.00)
                    </CardDescription>
                </div>

                {hasData && (
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground tabular-nums">
                        <span>
                            Avg:{' '}
                            <strong className="text-foreground">
                                {formatApdex(stats.avg)}
                            </strong>
                        </span>
                        <span>·</span>
                        <span>
                            Current:{' '}
                            <strong className={latestRating.colorClass}>
                                {formatApdex(stats.latest)} (
                                {latestRating.label})
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
                                        id="gradientApdex"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#10b981"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#10b981"
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
                                    domain={[0, 1]}
                                    ticks={[0, 0.5, 0.7, 0.85, 0.94, 1.0]}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 11 }}
                                    tickFormatter={(val: number) =>
                                        val.toFixed(2)
                                    }
                                    className="text-muted-foreground font-mono"
                                />
                                <Tooltip
                                    formatter={(value: unknown) => {
                                        const num =
                                            typeof value === 'number'
                                                ? value
                                                : Number(value);
                                        const rating = getApdexRating(num);
                                        return [
                                            `${formatApdex(num)} (${rating.label})`,
                                            'Apdex Score',
                                        ];
                                    }}
                                    contentStyle={{
                                        borderRadius: '0.75rem',
                                        borderColor: 'hsl(var(--border))',
                                        backgroundColor: 'hsl(var(--popover))',
                                        fontSize: '12px',
                                        boxShadow:
                                            '0 10px 15px -3px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <ReferenceLine
                                    y={0.85}
                                    stroke="#3b82f6"
                                    strokeDasharray="3 3"
                                    strokeOpacity={0.5}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="apdexScore"
                                    name="Apdex"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fill="url(#gradientApdex)"
                                    connectNulls
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <PerformanceChartEmptyState message="No Apdex score data available for the selected period" />
                )}
            </CardContent>
        </Card>
    );
}
