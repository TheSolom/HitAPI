import { useMemo, useState } from 'react';
import type { Period } from '@hitapi/types';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingCards } from '@/components/states/LoadingState';
import { useConsumersChartQuery } from '../../hooks';
import {
    calculateConsumerTotals,
    transformConsumerChartData,
} from './chart.utils';
import {
    ConsumersChartHeader,
    type ChartViewType,
} from './ConsumersChartHeader';
import { ConsumersChartEmptyState } from './ConsumersChartEmptyState';
import { ConsumersChartView } from './ConsumersChartView';

export interface ConsumersChartProps {
    readonly appId: string;
    readonly period?: Period;
    readonly consumerGroupId?: number;
    readonly consumerId?: number;
}

export function ConsumersChart({
    appId,
    period,
    consumerGroupId,
    consumerId,
}: ConsumersChartProps) {
    const [chartType, setChartType] = useState<ChartViewType>('bar');

    const chartQuery = useConsumersChartQuery({
        appId,
        period,
        consumerGroupId,
        consumerId,
    });

    const chartData = useMemo(
        () => transformConsumerChartData(chartQuery.data),
        [chartQuery.data],
    );

    const { totalNew, totalExisting } = useMemo(
        () => calculateConsumerTotals(chartData),
        [chartData],
    );

    if (chartQuery.isLoading) {
        return <LoadingCards count={1} />;
    }

    return (
        <Card className="overflow-hidden border-border/60 shadow-xs bg-linear-to-b from-card to-card/50">
            <ConsumersChartHeader
                hasData={chartData.length > 0}
                totalNew={totalNew}
                totalExisting={totalExisting}
                chartType={chartType}
                onChartTypeChange={setChartType}
            />

            <CardContent className="pt-5">
                {chartData.length === 0 ? (
                    <ConsumersChartEmptyState />
                ) : (
                    <ConsumersChartView
                        chartType={chartType}
                        chartData={chartData}
                    />
                )}
            </CardContent>
        </Card>
    );
}
