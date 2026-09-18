import { useMemo } from 'react';
import { ArrowDownUp } from 'lucide-react';
import type { GetTrafficOptions } from '@hitapi/types';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { LoadingCards } from '@/components/states/LoadingState';
import { useDataTransferredChartQuery } from '../../hooks';
import { formatBytes } from '../../utils';
import { transformDataTransferredChartData } from './chart.utils';
import { DataTransferredChartTooltip } from './DataTransferredChartTooltip';
import { RequestsChartEmptyState } from './RequestsChartEmptyState';

export interface DataTransferredChartProps {
    options: Partial<GetTrafficOptions>;
}

export function DataTransferredChart({
    options,
}: Readonly<DataTransferredChartProps>) {
    const { data: rawData, isLoading } = useDataTransferredChartQuery(options);

    const chartData = useMemo(
        () => transformDataTransferredChartData(rawData),
        [rawData],
    );

    const totals = useMemo(() => {
        let req = 0;
        let res = 0;
        for (const item of chartData) {
            req += item.requestBytes;
            res += item.responseBytes;
        }
        return { totalReq: req, totalRes: res, grandTotal: req + res };
    }, [chartData]);

    if (isLoading) {
        return <LoadingCards count={1} />;
    }

    const hasData = chartData.length > 0;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between border-b">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-semibold tracking-tight">
                            Data Transferred
                        </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        Volume of network traffic transferred across requests
                        and responses
                    </CardDescription>
                </div>

                {hasData && (
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground tabular-nums">
                        <span>
                            In:{' '}
                            <strong className="text-foreground">
                                {formatBytes(totals.totalReq)}
                            </strong>
                        </span>
                        <span>·</span>
                        <span>
                            Out:{' '}
                            <strong className="text-foreground">
                                {formatBytes(totals.totalRes)}
                            </strong>
                        </span>
                        <span>·</span>
                        <span>
                            Total:{' '}
                            <strong className="text-foreground">
                                {formatBytes(totals.grandTotal)}
                            </strong>
                        </span>
                    </div>
                )}
            </CardHeader>

            <CardContent className="pt-4">
                {hasData ? (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -10,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="gradientReqBytes"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#8b5cf6"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#8b5cf6"
                                            stopOpacity={0.05}
                                        />
                                    </linearGradient>
                                    <linearGradient
                                        id="gradientResBytes"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#06b6d4"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#06b6d4"
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
                                    tickFormatter={(val: number) =>
                                        formatBytes(val, 0)
                                    }
                                    className="text-muted-foreground font-mono"
                                />
                                <Tooltip
                                    content={<DataTransferredChartTooltip />}
                                />
                                <Legend
                                    wrapperStyle={{
                                        fontSize: '11px',
                                        paddingTop: '10px',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="requestBytes"
                                    name="Request Payload (Inbound)"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    fill="url(#gradientReqBytes)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="responseBytes"
                                    name="Response Payload (Outbound)"
                                    stroke="#06b6d4"
                                    strokeWidth={2}
                                    fill="url(#gradientResBytes)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <RequestsChartEmptyState />
                )}
            </CardContent>
        </Card>
    );
}
