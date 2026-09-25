import { AlertTriangle } from 'lucide-react';
import { ChartHeader } from '@/components/common/ChartHeader';
import type { ChartViewType } from '@/types/chart';

export interface ErrorsChartHeaderProps {
    readonly hasData: boolean;
    readonly totalClientErrors: number;
    readonly totalServerErrors: number;
    readonly chartType: ChartViewType;
    readonly onChartTypeChange: (type: ChartViewType) => void;
}

export function ErrorsChartHeader({
    hasData,
    totalClientErrors,
    totalServerErrors,
    chartType,
    onChartTypeChange,
}: ErrorsChartHeaderProps) {
    return (
        <ChartHeader
            icon={AlertTriangle}
            title="Error Volume Timeline"
            description="Aggregated client (4xx) and server (5xx) error occurrences over time"
            hasData={hasData}
            summary={
                <span className="text-[11px] text-muted-foreground tabular-nums">
                    {totalClientErrors.toLocaleString()} 4xx ·{' '}
                    {totalServerErrors.toLocaleString()} 5xx
                </span>
            }
            chartType={chartType}
            onChartTypeChange={onChartTypeChange}
        />
    );
}
