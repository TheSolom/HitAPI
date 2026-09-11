import { useMemo } from 'react';
import type { GetErrorOptions } from '@hitapi/types';
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
import { Percent } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { LoadingCards } from '@/components/states/LoadingState';
import { useErrorRatesChartQuery } from '../../hooks';
import { transformErrorRatesChartData } from './chart.utils';
import { ErrorsChartEmptyState } from './ErrorsChartEmptyState';

interface ErrorRatesChartProps {
    readonly options: Partial<GetErrorOptions>;
}

export function ErrorRatesChart({ options }: ErrorRatesChartProps) {
    const ratesQuery = useErrorRatesChartQuery(options);

    const chartData = useMemo(
        () => transformErrorRatesChartData(ratesQuery.data),
        [ratesQuery.data],
    );

    if (ratesQuery.isLoading) {
        return <LoadingCards count={1} />;
    }

    if (chartData.length === 0) {
        return (
            <Card className="overflow-hidden">
                <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between border-b bg-muted/10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Percent className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-sm font-semibold tracking-tight">
                                Error Rate Percentage Trend
                            </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-muted-foreground">
                            Percentage of total incoming requests resulting in
                            4xx vs 5xx errors
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-5">
                    <ErrorsChartEmptyState
                        icon={Percent}
                        title="No Error Rate Data"
                        description="Zero error percentages recorded in this time window."
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between border-b bg-muted/10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Percent className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-semibold tracking-tight">
                            Error Rate Percentage Trend
                        </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        Percentage of total incoming requests resulting in 4xx
                        vs 5xx errors
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="pt-5">
                <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -20,
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
                                unit="%"
                                className="text-muted-foreground font-mono"
                            />
                            <Tooltip
                                formatter={(value: unknown, name?: unknown) => {
                                    const numVal =
                                        typeof value === 'number'
                                            ? value
                                            : Number(value) || 0;
                                    return [
                                        `${numVal.toFixed(2)}%`,
                                        String(name) === 'clientErrorRate'
                                            ? '4xx Client Rate'
                                            : '5xx Server Rate',
                                    ];
                                }}
                                contentStyle={{
                                    borderRadius: '0.75rem',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--popover)',
                                    fontSize: '12px',
                                }}
                            />
                            <Legend
                                wrapperStyle={{
                                    fontSize: '11px',
                                    paddingTop: '10px',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="clientErrorRate"
                                name="4xx Error Rate (%)"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="serverErrorRate"
                                name="5xx Error Rate (%)"
                                stroke="#f43f5e"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
