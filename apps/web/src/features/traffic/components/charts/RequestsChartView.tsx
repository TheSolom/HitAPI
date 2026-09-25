import type { RequestsChartEntry } from './chart.utils';
import { RequestsChartTooltip } from './RequestsChartTooltip';
import type { ChartSeries, ChartViewType } from '@/types/chart';
import { TimeSeriesChartView } from '@/components/common/TimeSeriesChartView';

export interface RequestsChartViewProps {
    chartType: ChartViewType;
    chartData: readonly RequestsChartEntry[];
}

const REQUEST_SERIES: readonly ChartSeries[] = [
    {
        dataKey: 'successful',
        name: 'Successful (2xx/3xx)',
        color: '#10b981',
        radius: [0, 0, 0, 0],
        fillOpacity: 0.8,
    },
    {
        dataKey: 'clientError',
        name: 'Client Error (4xx)',
        color: '#f59e0b',
        radius: [0, 0, 0, 0],
        fillOpacity: 0.8,
    },
    {
        dataKey: 'serverError',
        name: 'Server Error (5xx)',
        color: '#f43f5e',
        radius: [3, 3, 0, 0],
        fillOpacity: 0.8,
    },
];

export function RequestsChartView({
    chartType,
    chartData,
}: Readonly<RequestsChartViewProps>) {
    return (
        <TimeSeriesChartView
            chartType={chartType}
            chartData={chartData}
            series={REQUEST_SERIES}
            tooltipContent={<RequestsChartTooltip />}
            stackId="requests"
        />
    );
}
