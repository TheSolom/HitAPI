import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { ChartMode, ResourceChartDataPoint } from './chart.utils';
import { CpuMemoryChartTooltip } from './CpuMemoryChartTooltip';

export interface CpuMemoryChartViewProps {
    readonly mode: ChartMode;
    readonly chartData: readonly ResourceChartDataPoint[];
}

export function CpuMemoryChartView({
    mode,
    chartData,
}: CpuMemoryChartViewProps) {
    return (
        <div className="h-85 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                >
                    <defs>
                        <linearGradient
                            id="cpuGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="5%"
                                stopColor="#3b82f6"
                                stopOpacity={0.12}
                            />
                            <stop
                                offset="95%"
                                stopColor="#3b82f6"
                                stopOpacity={0.0}
                            />
                        </linearGradient>
                        <linearGradient
                            id="memGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="5%"
                                stopColor="#64748b"
                                stopOpacity={0.12}
                            />
                            <stop
                                offset="95%"
                                stopColor="#64748b"
                                stopOpacity={0.0}
                            />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        className="stroke-border/40"
                    />

                    <XAxis
                        dataKey="formattedTime"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                        className="fill-muted-foreground"
                        minTickGap={30}
                    />

                    {(mode === 'combined' || mode === 'cpu') && (
                        <YAxis
                            yAxisId="cpu"
                            orientation="left"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                            className="fill-muted-foreground"
                            unit="%"
                            domain={[0, 'auto']}
                        />
                    )}

                    {(mode === 'combined' || mode === 'memory') && (
                        <YAxis
                            yAxisId="mem"
                            orientation={mode === 'combined' ? 'right' : 'left'}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                            className="fill-muted-foreground"
                            unit="MB"
                            domain={[0, 'auto']}
                        />
                    )}

                    <Tooltip content={<CpuMemoryChartTooltip />} />
                    <Legend
                        wrapperStyle={{
                            fontSize: '11px',
                            paddingBottom: '12px',
                        }}
                    />

                    {(mode === 'combined' || mode === 'cpu') && (
                        <Area
                            yAxisId="cpu"
                            type="monotone"
                            dataKey="cpuAvg"
                            name="CPU Avg (%)"
                            stroke="#3b82f6"
                            strokeWidth={1.5}
                            fill="url(#cpuGradient)"
                        />
                    )}

                    {mode === 'cpu' && (
                        <>
                            <Line
                                yAxisId="cpu"
                                type="monotone"
                                dataKey="cpuMax"
                                name="CPU Max (%)"
                                stroke="#f59e0b"
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                dot={false}
                            />
                            <Line
                                yAxisId="cpu"
                                type="monotone"
                                dataKey="cpuMin"
                                name="CPU Min (%)"
                                stroke="#94a3b8"
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                dot={false}
                            />
                        </>
                    )}

                    {(mode === 'combined' || mode === 'memory') && (
                        <Area
                            yAxisId="mem"
                            type="monotone"
                            dataKey="memAvgMb"
                            name="Memory Avg (MB)"
                            stroke="#64748b"
                            strokeWidth={1.5}
                            fill="url(#memGradient)"
                        />
                    )}

                    {mode === 'memory' && (
                        <>
                            <Line
                                yAxisId="mem"
                                type="monotone"
                                dataKey="memMaxMb"
                                name="Memory Max (MB)"
                                stroke="#f59e0b"
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                dot={false}
                            />
                            <Line
                                yAxisId="mem"
                                type="monotone"
                                dataKey="memMinMb"
                                name="Memory Min (MB)"
                                stroke="#94a3b8"
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                dot={false}
                            />
                        </>
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
