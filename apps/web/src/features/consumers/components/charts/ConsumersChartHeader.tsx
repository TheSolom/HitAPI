import {
    BarChart2,
    LineChart as LineChartIcon,
    Sparkles,
    TrendingUp,
    Users,
} from 'lucide-react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export type ChartViewType = 'bar' | 'area';

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
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between border-b bg-muted/10">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-semibold tracking-tight">
                        Active Consumer Trends
                    </CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                    Volume of unique active consumers making API requests across
                    time windows
                </CardDescription>
            </div>

            {hasData && (
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Summary Badges */}
                    <div className="flex items-center gap-1.5 bg-muted/40 rounded-lg p-1 border text-xs">
                        <Badge
                            variant="outline"
                            className="h-6 gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-semibold"
                        >
                            <Sparkles className="h-3 w-3" />
                            <span>{totalNew} New</span>
                        </Badge>
                        <Badge
                            variant="outline"
                            className="h-6 gap-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 text-[11px] font-semibold"
                        >
                            <Users className="h-3 w-3" />
                            <span>{totalExisting} Existing</span>
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
