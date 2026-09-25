import type { ConsumerChartEntry } from './chart.utils';
import { ConsumersChartTooltip } from './ConsumersChartTooltip';
import type { ChartSeries, ChartViewType } from '@/types/chart';
import { TimeSeriesChartView } from '@/components/common/TimeSeriesChartView';

export interface ConsumersChartViewProps {
    readonly chartType: ChartViewType;
    readonly chartData: readonly ConsumerChartEntry[];
}

const CONSUMER_SERIES: readonly ChartSeries[] = [
    {
        dataKey: 'Existing',
        name: 'Existing Clients',
        color: '#8b5cf6',
        radius: [0, 0, 3, 3],
        fillOpacity: 0.4,
    },
    {
        dataKey: 'New',
        name: 'New Clients',
        color: '#10b981',
        radius: [3, 3, 0, 0],
        fillOpacity: 0.4,
    },
];

export function ConsumersChartView({
    chartType,
    chartData,
}: ConsumersChartViewProps) {
    return (
        <TimeSeriesChartView
            chartType={chartType}
            chartData={chartData}
            series={CONSUMER_SERIES}
            tooltipContent={<ConsumersChartTooltip />}
            stackId="consumers"
        />
    );
}
