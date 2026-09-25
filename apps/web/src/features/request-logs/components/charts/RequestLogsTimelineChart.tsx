import { useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import type { GetRequestLogTimelineOptions } from '@hitapi/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartHeader, TimeSeriesChartView } from '@/components/common';
import { formatNumber, formatTimeWindow } from '@/lib/format';
import type { ChartSeries, ChartViewType } from '@/types/chart';
import { useRequestLogsTimelineQuery } from '../../hooks';
import { RequestLogsTimelineChartTooltip } from './RequestLogsTimelineChartTooltip';
import { RequestLogsTimelineEmptyState } from './RequestLogsTimelineEmptyState';

export interface RequestLogsTimelineChartProps {
    options: Partial<GetRequestLogTimelineOptions>;
}

interface TimelinePoint {
    time: string;
    formattedTime: string;
    requests: number;
}

const SERIES: ChartSeries[] = [
    {
        dataKey: 'requests',
        name: 'Requests',
        color: 'var(--color-chart-1, #3b82f6)',
        fillOpacity: 0.25,
    },
];

export function RequestLogsTimelineChart({
    options,
}: Readonly<RequestLogsTimelineChartProps>) {
    const [chartType, setChartType] = useState<ChartViewType>('area');
    const { data, isLoading } = useRequestLogsTimelineQuery(options);

    const chartData = useMemo<TimelinePoint[]>(() => {
        if (!data) return [];

        return data.timeWindows.map((tw, idx) => ({
            time: tw,
            formattedTime: formatTimeWindow(tw),
            requests: data.itemCounts[idx] ?? 0,
        }));
    }, [data]);

    const totalRequests = useMemo(
        () => (data ? data.itemCounts.reduce((acc, curr) => acc + curr, 0) : 0),
        [data],
    );

    const hasData = chartData.some((point) => point.requests > 0);

    return (
        <Card className="shadow-sm">
            <ChartHeader
                icon={Activity}
                title="Request Volume Timeline"
                description="Aggregated request volume timeline for the selected filters and time period."
                hasData={hasData}
                chartType={chartType}
                onChartTypeChange={setChartType}
                summary={
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Total:</span>
                        <span className="font-semibold font-mono text-foreground">
                            {formatNumber(totalRequests)}
                        </span>
                    </div>
                }
            />

            <CardContent className="pt-4">
                {isLoading && (
                    <div className="space-y-3">
                        <Skeleton className="h-60 w-full rounded-md" />
                    </div>
                )}

                {!isLoading && !hasData && <RequestLogsTimelineEmptyState />}

                {!isLoading && hasData && (
                    <TimeSeriesChartView
                        chartType={chartType}
                        chartData={chartData}
                        series={SERIES}
                        tooltipContent={<RequestLogsTimelineChartTooltip />}
                    />
                )}
            </CardContent>
        </Card>
    );
}
