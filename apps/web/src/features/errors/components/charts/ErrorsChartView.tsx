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
import type { ErrorTimelineEntry } from './chart.utils';
import { ErrorsChartTooltip } from './ErrorsChartTooltip';
import type { ChartViewType } from './ErrorsChartHeader';

export interface ErrorsChartViewProps {
    readonly chartType: ChartViewType;
    readonly chartData: readonly ErrorTimelineEntry[];
}

export function ErrorsChartView({
    chartType,
    chartData,
}: ErrorsChartViewProps) {
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 10,
                            left: -20,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-border/30"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="formattedTime"
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
                        <Tooltip content={<ErrorsChartTooltip />} />
                        <Legend
                            wrapperStyle={{
                                fontSize: '11px',
                                paddingTop: '10px',
                            }}
                        />
                        <Bar
                            dataKey="clientErrors"
                            name="Client (4xx)"
                            stackId="errors"
                            fill="#f59e0b"
                            radius={[0, 0, 3, 3]}
                        />
                        <Bar
                            dataKey="serverErrors"
                            name="Server (5xx)"
                            stackId="errors"
                            fill="#f43f5e"
                            radius={[3, 3, 0, 0]}
                        />
                    </BarChart>
                ) : (
                    <AreaChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 10,
                            left: -20,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient
                                id="gradientClientErrors"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#f59e0b"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#f59e0b"
                                    stopOpacity={0.05}
                                />
                            </linearGradient>
                            <linearGradient
                                id="gradientServerErrors"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#f43f5e"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#f43f5e"
                                    stopOpacity={0.05}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-border/30"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="formattedTime"
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
                        <Tooltip content={<ErrorsChartTooltip />} />
                        <Legend
                            wrapperStyle={{
                                fontSize: '11px',
                                paddingTop: '10px',
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="clientErrors"
                            name="Client (4xx)"
                            stackId="errors"
                            stroke="#f59e0b"
                            fillOpacity={1}
                            fill="url(#gradientClientErrors)"
                        />
                        <Area
                            type="monotone"
                            dataKey="serverErrors"
                            name="Server (5xx)"
                            stackId="errors"
                            stroke="#f43f5e"
                            fillOpacity={1}
                            fill="url(#gradientServerErrors)"
                        />
                    </AreaChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
