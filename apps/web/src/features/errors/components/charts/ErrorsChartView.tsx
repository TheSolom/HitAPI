import type { ErrorTimelineEntry } from './chart.utils';
import { ErrorsChartTooltip } from './ErrorsChartTooltip';
import type { ChartSeries, ChartViewType } from '@/types/chart';
import { TimeSeriesChartView } from '@/components/common/TimeSeriesChartView';

export interface ErrorsChartViewProps {
    readonly chartType: ChartViewType;
    readonly chartData: readonly ErrorTimelineEntry[];
}

const ERROR_SERIES: readonly ChartSeries[] = [
    {
        dataKey: 'clientErrors',
        name: 'Client (4xx)',
        color: '#f59e0b',
        radius: [0, 0, 3, 3],
        fillOpacity: 0.8,
    },
    {
        dataKey: 'serverErrors',
        name: 'Server (5xx)',
        color: '#f43f5e',
        radius: [3, 3, 0, 0],
        fillOpacity: 0.8,
    },
];

export function ErrorsChartView({
    chartType,
    chartData,
}: ErrorsChartViewProps) {
    return (
        <TimeSeriesChartView
            chartType={chartType}
            chartData={chartData}
            series={ERROR_SERIES}
            tooltipContent={<ErrorsChartTooltip />}
            stackId="errors"
        />
    );
}
