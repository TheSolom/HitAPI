import { useMemo } from 'react';
import type { GetErrorOptions } from '@hitapi/types';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Users } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { LoadingCards } from '@/components/states/LoadingState';
import { useErrorsByConsumerChartQuery } from '../../hooks';
import { transformErrorsByConsumerChartData } from './chart.utils';
import { ErrorsChartEmptyState } from './ErrorsChartEmptyState';

interface ErrorsByConsumerChartProps {
    readonly options: Partial<GetErrorOptions>;
}

export function ErrorsByConsumerChart({ options }: ErrorsByConsumerChartProps) {
    const consumerErrorsQuery = useErrorsByConsumerChartQuery(options);

    const chartData = useMemo(
        () => transformErrorsByConsumerChartData(consumerErrorsQuery.data),
        [consumerErrorsQuery.data],
    );

    if (consumerErrorsQuery.isLoading) {
        return <LoadingCards count={1} />;
    }

    if (chartData.length === 0) {
        return (
            <Card className="overflow-hidden">
                <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between border-b bg-muted/10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                <Users className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-sm font-semibold tracking-tight">
                                Errors by Consumer
                            </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-muted-foreground">
                            Identified consumers receiving the highest number of
                            failed responses
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-5">
                    <ErrorsChartEmptyState
                        icon={Users}
                        title="No Affected Consumers"
                        description="No consumer identifiers were attached to the recorded errors."
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
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                            <Users className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-semibold tracking-tight">
                            Errors by Consumer
                        </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        Identified consumers receiving the highest number of
                        failed responses
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="pt-5">
                <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-border/30"
                                horizontal={false}
                            />
                            <XAxis
                                type="number"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11 }}
                                allowDecimals={false}
                                className="text-muted-foreground font-mono"
                            />
                            <YAxis
                                type="category"
                                dataKey="consumerName"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11 }}
                                width={100}
                                className="text-muted-foreground font-sans truncate"
                            />
                            <Tooltip
                                formatter={(value: unknown) => {
                                    const count =
                                        typeof value === 'number'
                                            ? value
                                            : Number(value) || 0;
                                    return [
                                        `${count.toLocaleString()} errors`,
                                        'Error Count',
                                    ];
                                }}
                                contentStyle={{
                                    borderRadius: '0.75rem',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--popover)',
                                    fontSize: '12px',
                                }}
                            />
                            <Bar
                                dataKey="requestCount"
                                name="Errors"
                                fill="#8b5cf6"
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
