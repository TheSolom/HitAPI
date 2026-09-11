import {
    AlertTriangle,
    BarChart2,
    LineChart as LineChartIcon,
} from 'lucide-react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export type ChartViewType = 'bar' | 'area';

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
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between border-b">
            <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-semibold tracking-tight">
                        Error Volume Timeline
                    </CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                    Aggregated client (4xx) and server (5xx) error occurrences
                    over time
                </CardDescription>
            </div>

            {hasData && (
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                        {totalClientErrors.toLocaleString()} 4xx ·{' '}
                        {totalServerErrors.toLocaleString()} 5xx
                    </span>

                    <div className="flex items-center rounded-md border bg-background p-0.5">
                        <Button
                            variant={
                                chartType === 'bar' ? 'secondary' : 'ghost'
                            }
                            size="icon"
                            className="h-7 w-7 rounded-sm"
                            onClick={() => {
                                onChartTypeChange('bar');
                            }}
                            title="Stacked Bar View"
                        >
                            <BarChart2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant={
                                chartType === 'area' ? 'secondary' : 'ghost'
                            }
                            size="icon"
                            className="h-7 w-7 rounded-sm"
                            onClick={() => {
                                onChartTypeChange('area');
                            }}
                            title="Area Trend View"
                        >
                            <LineChartIcon className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </CardHeader>
    );
}
