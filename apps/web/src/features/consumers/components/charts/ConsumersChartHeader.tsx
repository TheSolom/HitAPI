import { TrendingUp } from 'lucide-react';
import { ChartHeader } from '@/components/common/ChartHeader';
import type { ChartViewType } from '@/types/chart';

export interface ConsumersChartHeaderProps {
    readonly hasData: boolean;
    readonly totalNew: number;
    readonly totalExisting: number;
    readonly chartType: ChartViewType;
    readonly onChartTypeChange: (type: ChartViewType) => void;
}

export function ConsumersChartHeader({
    hasData,
    totalNew,
    totalExisting,
    chartType,
    onChartTypeChange,
}: ConsumersChartHeaderProps) {
    return (
        <ChartHeader
            icon={TrendingUp}
            title="Active Consumer Trends"
            description="Unique active consumers making API requests over time"
            hasData={hasData}
            summary={
                <span className="text-[11px] text-muted-foreground tabular-nums">
                    {totalNew} new · {totalExisting} existing
                </span>
            }
            chartType={chartType}
            onChartTypeChange={onChartTypeChange}
        />
    );
}
