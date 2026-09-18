import { useMemo, useState } from 'react';
import type { GetTrafficOptions } from '@hitapi/types';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingCards } from '@/components/states/LoadingState';
import { useRequestsChartQuery } from '../../hooks';
import { transformRequestsChartData } from './chart.utils';
import { RequestsChartHeader, type ChartViewType } from './RequestsChartHeader';
import { RequestsChartView } from './RequestsChartView';
import { RequestsChartEmptyState } from './RequestsChartEmptyState';

export interface RequestsChartProps {
    options: Partial<GetTrafficOptions>;
}

export function RequestsChart({ options }: Readonly<RequestsChartProps>) {
    const [chartType, setChartType] = useState<ChartViewType>('bar');
    const { data: rawDatasets, isLoading } = useRequestsChartQuery(options);

    const chartData = useMemo(
        () => transformRequestsChartData(rawDatasets),
        [rawDatasets],
    );

    const totals = useMemo(() => {
        let reqs = 0;
        let errs = 0;
        for (const item of chartData) {
            reqs += item.total;
            errs += item.clientError + item.serverError;
        }
        return { totalRequests: reqs, totalErrors: errs };
    }, [chartData]);

    if (isLoading) {
        return <LoadingCards count={1} />;
    }

    const hasData = chartData.length > 0;

    return (
        <Card className="overflow-hidden">
            <RequestsChartHeader
                hasData={hasData}
                totalRequests={totals.totalRequests}
                totalErrors={totals.totalErrors}
                chartType={chartType}
                onChartTypeChange={setChartType}
            />

            <CardContent className="pt-4">
                {hasData ? (
                    <RequestsChartView
                        chartType={chartType}
                        chartData={chartData}
                    />
                ) : (
                    <RequestsChartEmptyState />
                )}
            </CardContent>
        </Card>
    );
}
