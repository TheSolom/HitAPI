import {
    Activity,
    AlertTriangle,
    ArrowDownUp,
    Gauge,
    HardDrive,
    Users,
} from 'lucide-react';
import type { GetTrafficOptions } from '@hitapi/types';
import { MetricsCardsSkeleton, StatCard } from '@/components/common';
import { formatNumber } from '@/lib/format';
import { formatPeriodDescription } from '@/lib/utils';
import { useTrafficMetricsQuery } from '../../hooks';
import { formatBytes, formatRate } from '../../utils';

export interface TrafficMetricsCardsProps {
    options: Partial<GetTrafficOptions>;
}

export function TrafficMetricsCards({
    options,
}: Readonly<TrafficMetricsCardsProps>) {
    const { data: metrics, isLoading } = useTrafficMetricsQuery(options);

    if (isLoading) {
        return <MetricsCardsSkeleton count={6} />;
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
            <StatCard
                title="Total Requests"
                value={formatNumber(totalRequests)}
                description={formatPeriodDescription(options.period)}
                icon={Activity}
            />

            <StatCard
                title="Requests / Min"
                value={requestsPerMinute.toFixed(2)}
                description="Average throughput"
                icon={Gauge}
            />

            <StatCard
                title="Error Rate"
                value={formatRate(errorRate)}
                description={`${formatNumber(clientErrors)} client · ${formatNumber(serverErrors)} server`}
                icon={AlertTriangle}
                valueClassName={getErrorRateColorClass(errorRate)}
            />

            <StatCard
                title="Data Transferred"
                value={formatBytes(totalDataTransferred)}
                description={`In: ${formatBytes(requestSizeSum)} · Out: ${formatBytes(responseSizeSum)}`}
                icon={ArrowDownUp}
            />

            <StatCard
                title="Avg Payload"
                value={formatBytes(responseSizeAvg)}
                description={`Request avg: ${formatBytes(requestSizeAvg)}`}
                icon={HardDrive}
            />

            <StatCard
                title="Unique Consumers"
                value={formatNumber(uniqueConsumers)}
                description="Active client consumers"
                icon={Users}
            />
        </div>
    );
}
