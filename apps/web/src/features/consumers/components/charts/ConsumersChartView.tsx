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
import type { ConsumerChartEntry } from './chart.utils';
import { ConsumersChartTooltip } from './ConsumersChartTooltip';
import type { ChartViewType } from './ConsumersChartHeader';

export interface ConsumersChartViewProps {
    readonly chartType: ChartViewType;
    readonly chartData: readonly ConsumerChartEntry[];
}

export function ConsumersChartView({
    chartType,
    chartData,
}: ConsumersChartViewProps) {
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
                        <Tooltip content={<ConsumersChartTooltip />} />
                        <Legend
                            wrapperStyle={{
                                fontSize: '11px',
                                paddingTop: '10px',
                            }}
                        />
                        <Bar
                            dataKey="Existing"
                            name="Existing Clients"
                            stackId="consumers"
                            fill="#8b5cf6"
                            radius={[0, 0, 3, 3]}
                        />
                        <Bar
                            dataKey="New"
                            name="New Clients"
                            stackId="consumers"
                            fill="#10b981"
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
                                id="gradientNew"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#10b981"
                                    stopOpacity={0.4}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#10b981"
                                    stopOpacity={0.0}
                                />
                            </linearGradient>
                            <linearGradient
                                id="gradientExisting"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#8b5cf6"
                                    stopOpacity={0.4}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#8b5cf6"
                                    stopOpacity={0.0}
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
                        <Tooltip content={<ConsumersChartTooltip />} />
                        <Legend
                            wrapperStyle={{
                                fontSize: '11px',
                                paddingTop: '10px',
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="Existing"
                            name="Existing Clients"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#gradientExisting)"
                        />
                        <Area
                            type="monotone"
                            dataKey="New"
                            name="New Clients"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#gradientNew)"
                        />
                    </AreaChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
