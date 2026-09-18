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
import type { RequestsChartEntry } from './chart.utils';
import { RequestsChartTooltip } from './RequestsChartTooltip';
import type { ChartViewType } from './RequestsChartHeader';

export interface RequestsChartViewProps {
    readonly chartType: ChartViewType;
    readonly chartData: readonly RequestsChartEntry[];
}

export function RequestsChartView({
    chartType,
    chartData,
}: RequestsChartViewProps) {
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
                        <Tooltip content={<RequestsChartTooltip />} />
                        <Legend
                            wrapperStyle={{
                                fontSize: '11px',
                                paddingTop: '10px',
                            }}
                        />
                        <Bar
                            dataKey="successful"
                            name="Successful (2xx/3xx)"
                            stackId="requests"
                            fill="#10b981"
                            radius={[0, 0, 0, 0]}
                        />
                        <Bar
                            dataKey="clientError"
                            name="Client Error (4xx)"
                            stackId="requests"
                            fill="#f59e0b"
                            radius={[0, 0, 0, 0]}
                        />
                        <Bar
                            dataKey="serverError"
                            name="Server Error (5xx)"
                            stackId="requests"
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
                                id="gradientSuccessful"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#10b981"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#10b981"
                                    stopOpacity={0.05}
                                />
                            </linearGradient>
                            <linearGradient
                                id="gradientClientError"
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
                                id="gradientServerError"
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
                        <Tooltip content={<RequestsChartTooltip />} />
                        <Legend
                            wrapperStyle={{
                                fontSize: '11px',
                                paddingTop: '10px',
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="successful"
                            name="Successful (2xx/3xx)"
                            stackId="requests"
                            stroke="#10b981"
                            fill="url(#gradientSuccessful)"
                        />
                        <Area
                            type="monotone"
                            dataKey="clientError"
                            name="Client Error (4xx)"
                            stackId="requests"
                            stroke="#f59e0b"
                            fill="url(#gradientClientError)"
                        />
                        <Area
                            type="monotone"
                            dataKey="serverError"
                            name="Server Error (5xx)"
                            stackId="requests"
                            stroke="#f43f5e"
                            fill="url(#gradientServerError)"
                        />
                    </AreaChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
