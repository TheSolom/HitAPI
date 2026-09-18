import {
    Activity,
    AlertTriangle,
    ArrowDownUp,
    Gauge,
    HardDrive,
    Users,
} from 'lucide-react';
import type { GetTrafficOptions } from '@hitapi/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatPeriodDescription } from '@/lib/utils';
import { useTrafficMetricsQuery } from '../../hooks';
import { formatBytes, formatNumber, formatRate } from '../../utils';
import { TrafficStatCard } from './TrafficStatCard';

export interface TrafficMetricsCardsProps {
    readonly options: Partial<GetTrafficOptions>;
}

export function TrafficMetricsCards({ options }: TrafficMetricsCardsProps) {
    const { data: metrics, isLoading } = useTrafficMetricsQuery(options);

    if (isLoading) {
        return (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {[1, 2, 3, 4, 5, 6].map((key) => (
                    <Card key={key} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="h-3 w-20 rounded bg-muted" />
                            <div className="h-4 w-4 rounded bg-muted" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="h-7 w-16 rounded bg-muted" />
                            <div className="h-3 w-24 rounded bg-muted" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const totalRequests = metrics?.totalRequestCount ?? 0;
    const requestsPerMinute = metrics?.requestsPerMinute ?? 0;
    const clientErrors = metrics?.clientErrorCount ?? 0;
    const serverErrors = metrics?.serverErrorCount ?? 0;
    const errorRate = metrics?.errorRate ?? 0;
    const totalDataTransferred = metrics?.totalDataTransferred ?? 0;
    const requestSizeSum = metrics?.requestSizeSum ?? 0;
    const responseSizeSum = metrics?.responseSizeSum ?? 0;
    const responseSizeAvg = metrics?.responseSizeAvg ?? 0;
    const requestSizeAvg = metrics?.requestSizeAvg ?? 0;
    const uniqueConsumers = metrics?.uniqueConsumerCount ?? 0;

    const getErrorRateColorClass = (rate: number) => {
        if (rate > 5) return 'text-destructive';
        if (rate > 0) return 'text-amber-500';
        return undefined;
    };

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <TrafficStatCard
                title="Total Requests"
                value={formatNumber(totalRequests)}
                description={formatPeriodDescription(options.period)}
                icon={Activity}
            />

            <TrafficStatCard
                title="Requests / Min"
                value={requestsPerMinute.toFixed(2)}
                description="Average throughput"
                icon={Gauge}
            />

            <TrafficStatCard
                title="Error Rate"
                value={formatRate(errorRate)}
                description={`${formatNumber(clientErrors)} client · ${formatNumber(serverErrors)} server`}
                icon={AlertTriangle}
                valueClassName={getErrorRateColorClass(errorRate)}
            />

            <TrafficStatCard
                title="Data Transferred"
                value={formatBytes(totalDataTransferred)}
                description={`In: ${formatBytes(requestSizeSum)} · Out: ${formatBytes(responseSizeSum)}`}
                icon={ArrowDownUp}
            />

            <TrafficStatCard
                title="Avg Payload"
                value={formatBytes(responseSizeAvg)}
                description={`Request avg: ${formatBytes(requestSizeAvg)}`}
                icon={HardDrive}
            />

            <TrafficStatCard
                title="Unique Consumers"
                value={formatNumber(uniqueConsumers)}
                description="Active client consumers"
                icon={Users}
            />
        </div>
    );
}
