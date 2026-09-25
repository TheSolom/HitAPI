import { TrendingUp } from 'lucide-react';
import { ChartHeader } from '@/components/common/ChartHeader';
import { formatNumber } from '@/lib/format';
import type { ChartViewType } from '@/types/chart';

export interface RequestsChartHeaderProps {
    hasData: boolean;
    totalRequests: number;
    totalErrors: number;
    chartType: ChartViewType;
    onChartTypeChange: (type: ChartViewType) => void;
}

export function RequestsChartHeader({
    hasData,
    totalRequests,
    totalErrors,
    chartType,
    onChartTypeChange,
}: Readonly<RequestsChartHeaderProps>) {
    return (
        <ChartHeader
            icon={TrendingUp}
            title="Request Volume Trends"
            description="Incoming request volume categorized by response status over time"
            hasData={hasData}
            summary={
                <span className="text-[11px] text-muted-foreground tabular-nums">
                    {formatNumber(totalRequests)} requests ·{' '}
                    {formatNumber(totalErrors)} errors
                </span>
            }
            chartType={chartType}
            onChartTypeChange={onChartTypeChange}
        />
    );
}
