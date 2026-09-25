import type { ReactElement } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { ChartSeries, ChartViewType } from '@/types/chart';

export interface TimeSeriesChartViewProps<T> {
    chartType: ChartViewType;
    chartData: readonly T[];
    series: readonly ChartSeries[];
    tooltipContent: ReactElement;
    stackId?: string;
    xAxisDataKey?: string;
}

export function TimeSeriesChartView<T = unknown>({
    chartType,
    chartData,
    series,
    tooltipContent,
    stackId,
    xAxisDataKey = 'formattedTime',
}: Readonly<TimeSeriesChartViewProps<T>>) {
    const margin = { top: 10, right: 10, left: -20, bottom: 0 };

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                    <BarChart data={chartData} margin={margin}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-border/30"
                            vertical={false}
                        />
                        <XAxis
                            dataKey={xAxisDataKey}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                            className="text-muted-foreground font-mono"
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                            allowDecimals={false}
                            className="text-muted-foreground font-mono"
                        />
                        <Tooltip content={tooltipContent} />
                        <Legend
                            wrapperStyle={{
                                fontSize: '11px',
                                paddingTop: '10px',
                            }}
                        />
                        {series.map((s) => (
                            <Bar
                                key={s.dataKey}
                                dataKey={s.dataKey}
                                name={s.name}
                                stackId={stackId}
                                fill={s.color}
                                radius={s.radius}
                            />
                        ))}
                    </BarChart>
                ) : (
                    <AreaChart data={chartData} margin={margin}>
                        <defs>
                            {series.map((s) => (
                                <linearGradient
                                    key={s.dataKey}
                                    id={`gradient-${s.dataKey}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor={s.color}
                                        stopOpacity={s.fillOpacity ?? 0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={s.color}
                                        stopOpacity={0.05}
                                    />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-border/30"
                            vertical={false}
                        />
                        <XAxis
                            dataKey={xAxisDataKey}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                            className="text-muted-foreground font-mono"
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                            allowDecimals={false}
                            className="text-muted-foreground font-mono"
                        />
                        <Tooltip content={tooltipContent} />
                        <Legend
                            wrapperStyle={{
                                fontSize: '11px',
                                paddingTop: '10px',
                            }}
                        />
                        {series.map((s) => (
                            <Area
                                key={s.dataKey}
                                type="monotone"
                                dataKey={s.dataKey}
                                name={s.name}
                                stackId={stackId}
                                stroke={s.color}
                                strokeWidth={s.strokeWidth ?? 2}
                                fillOpacity={1}
                                fill={`url(#gradient-${s.dataKey})`}
                            />
                        ))}
                    </AreaChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
