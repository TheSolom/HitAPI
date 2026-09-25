import type { ReactNode } from 'react';
import {
    BarChart2,
    LineChart as LineChartIcon,
    type LucideIcon,
} from 'lucide-react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ChartViewType } from '@/types/chart';

export interface ChartHeaderProps {
    icon: LucideIcon;
    title: string;
    description: string;
    hasData: boolean;
    summary?: ReactNode;
    chartType: ChartViewType;
    onChartTypeChange: (type: ChartViewType) => void;
}

export function ChartHeader({
    icon: Icon,
    title,
    description,
    hasData,
    summary,
    chartType,
    onChartTypeChange,
}: Readonly<ChartHeaderProps>) {
    return (
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between border-b">
            <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-semibold tracking-tight">
                        {title}
                    </CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                    {description}
                </CardDescription>
            </div>

            {hasData && (
                <div className="flex flex-wrap items-center gap-2.5">
                    {summary}

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
