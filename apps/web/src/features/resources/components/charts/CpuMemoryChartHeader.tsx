import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartMode } from './chart.utils';

export interface CpuMemoryChartHeaderProps {
    readonly hasData: boolean;
    readonly dataPointCount: number;
    readonly mode: ChartMode;
    readonly onModeChange: (mode: ChartMode) => void;
}

export function CpuMemoryChartHeader({
    hasData,
    dataPointCount,
    mode,
    onModeChange,
}: CpuMemoryChartHeaderProps) {
    return (
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between border-b">
            <div className="space-y-0.5">
                <CardTitle className="text-sm font-semibold tracking-tight">
                    CPU &amp; Memory Utilization
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                    Time-series processor and resident memory load
                </CardDescription>
            </div>

            {hasData && (
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                        {dataPointCount} pts
                    </span>

                    <div className="flex items-center rounded-md border bg-background p-0.5 text-xs">
                        <Button
                            variant={
                                mode === 'combined' ? 'secondary' : 'ghost'
                            }
                            size="sm"
                            className="h-6 px-2.5 text-xs rounded-sm"
                            onClick={() => {
                                onModeChange('combined');
                            }}
                        >
                            Combined
                        </Button>
                        <Button
                            variant={mode === 'cpu' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-6 px-2.5 text-xs rounded-sm"
                            onClick={() => {
                                onModeChange('cpu');
                            }}
                        >
                            CPU
                        </Button>
                        <Button
                            variant={mode === 'memory' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-6 px-2.5 text-xs rounded-sm"
                            onClick={() => {
                                onModeChange('memory');
                            }}
                        >
                            Memory
                        </Button>
                    </div>
                </div>
            )}
        </CardHeader>
    );
}
