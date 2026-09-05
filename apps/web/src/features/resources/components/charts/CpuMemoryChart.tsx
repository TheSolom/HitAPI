import { useMemo, useState } from 'react';
import type { Period } from '@hitapi/types';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingCards } from '@/components/states/LoadingState';
import { useCpuMemoryChartQuery } from '../../hooks';
import { type ChartMode, transformResourceChartData } from './chart.utils';
import { CpuMemoryChartHeader } from './CpuMemoryChartHeader';
import { CpuMemoryChartEmptyState } from './CpuMemoryChartEmptyState';
import { CpuMemoryChartView } from './CpuMemoryChartView';

export interface CpuMemoryChartProps {
    readonly appId: string;
    readonly period?: Period;
}

export function CpuMemoryChart({ appId, period }: CpuMemoryChartProps) {
    const [mode, setMode] = useState<ChartMode>('combined');

    const chartQuery = useCpuMemoryChartQuery({
        appId,
        period,
    });

    const chartData = useMemo(
        () => transformResourceChartData(chartQuery.data),
        [chartQuery.data],
    );

    if (chartQuery.isLoading) {
        return <LoadingCards count={1} />;
    }

    return (
        <Card className="overflow-hidden border-border/60 shadow-xs bg-linear-to-b from-card to-card/50">
            <CpuMemoryChartHeader
                hasData={chartData.length > 0}
                dataPointCount={chartData.length}
                mode={mode}
                onModeChange={setMode}
            />

            <CardContent className="pt-5 pb-3">
                {chartData.length === 0 ? (
                    <CpuMemoryChartEmptyState />
                ) : (
                    <CpuMemoryChartView mode={mode} chartData={chartData} />
                )}
            </CardContent>
        </Card>
    );
}
