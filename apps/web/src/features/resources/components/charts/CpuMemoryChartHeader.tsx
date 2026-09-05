import { Activity, Cpu, HardDrive, Layers, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between border-b bg-muted/10">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Activity className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-semibold tracking-tight">
                        CPU & Memory Utilization
                    </CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                    Time-series metrics of processor and resident memory load
                    reported by SDK
                </CardDescription>
            </div>

            {hasData && (
                <div className="flex flex-wrap items-center gap-2.5">
                    <Badge
                        variant="outline"
                        className="h-6 gap-1 bg-muted/30 text-xs font-normal"
                    >
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span>{dataPointCount} data points</span>
                    </Badge>

                    {/* Mode Selector */}
                    <div className="flex items-center rounded-lg border bg-background p-0.5 text-xs">
                        <Button
                            variant={
                                mode === 'combined' ? 'secondary' : 'ghost'
                            }
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                                onModeChange('combined');
                            }}
                        >
                            <Layers className="h-3 w-3 mr-1" />
                            Combined
                        </Button>
                        <Button
                            variant={mode === 'cpu' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                                onModeChange('cpu');
                            }}
                        >
                            <Cpu className="h-3 w-3 mr-1" />
                            CPU %
                        </Button>
                        <Button
                            variant={mode === 'memory' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                                onModeChange('memory');
                            }}
                        >
                            <HardDrive className="h-3 w-3 mr-1" />
                            Memory MB
                        </Button>
                    </div>
                </div>
            )}
        </CardHeader>
    );
}
