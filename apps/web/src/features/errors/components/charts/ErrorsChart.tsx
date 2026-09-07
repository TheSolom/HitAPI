import { useMemo, useState } from 'react';
import type { GetErrorOptions } from '@hitapi/types';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingCards } from '@/components/states/LoadingState';
import { useErrorsChartQuery } from '../../hooks';
import { transformErrorsChartData } from './chart.utils';
import { ErrorsChartHeader, type ChartViewType } from './ErrorsChartHeader';
import { ErrorsChartEmptyState } from './ErrorsChartEmptyState';
import { ErrorsChartView } from './ErrorsChartView';

export interface ErrorsChartProps {
    readonly options: Partial<GetErrorOptions>;
}

export function ErrorsChart({ options }: ErrorsChartProps) {
    const [chartType, setChartType] = useState<ChartViewType>('bar');

    const chartQuery = useErrorsChartQuery(options);

    const chartData = useMemo(
        () => transformErrorsChartData(chartQuery.data),
        [chartQuery.data],
    );

    const { totalClientErrors, totalServerErrors } = useMemo(() => {
        let client = 0;
        let server = 0;
        chartData.forEach((d) => {
            client += d.clientErrors;
            server += d.serverErrors;
        });
        return { totalClientErrors: client, totalServerErrors: server };
    }, [chartData]);

    if (chartQuery.isLoading) {
        return <LoadingCards count={1} />;
    }

    return (
        <Card className="overflow-hidden border-border/60 shadow-xs bg-linear-to-b from-card to-card/50">
            <ErrorsChartHeader
                hasData={chartData.length > 0}
                totalClientErrors={totalClientErrors}
                totalServerErrors={totalServerErrors}
                chartType={chartType}
                onChartTypeChange={setChartType}
            />

            <CardContent className="pt-5">
                {chartData.length === 0 ? (
                    <ErrorsChartEmptyState />
                ) : (
                    <ErrorsChartView
                        chartType={chartType}
                        chartData={chartData}
                    />
                )}
            </CardContent>
        </Card>
    );
}
