import {
    AlertTriangle,
    BarChart2,
    LineChart as LineChartIcon,
} from 'lucide-react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between border-b bg-muted/10">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="h-4 w-4" />
                    </div>
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
                    {/* Summary Badges */}
                    <div className="flex items-center gap-1.5 bg-muted/40 rounded-lg p-1 border text-xs">
                        <Badge
                            variant="outline"
                            className="h-6 gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[11px] font-semibold"
                        >
                            <span>
                                {totalClientErrors.toLocaleString()} 4xx
                            </span>
                        </Badge>
                        <Badge
                            variant="outline"
                            className="h-6 gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[11px] font-semibold"
                        >
                            <span>
                                {totalServerErrors.toLocaleString()} 5xx
                            </span>
                        </Badge>
                    </div>

                    {/* Chart Type Toggle */}
                    <div className="flex items-center rounded-lg border bg-background p-0.5">
                        <Button
                            variant={
                                chartType === 'bar' ? 'secondary' : 'ghost'
                            }
                            size="icon"
                            className="h-7 w-7"
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
                            className="h-7 w-7"
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
