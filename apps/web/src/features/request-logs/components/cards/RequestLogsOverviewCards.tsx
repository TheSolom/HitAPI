import { Activity, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import type { RequestLogResponsePaginatedDto } from '@hitapi/types';
import { StatCard } from '@/components/common';
import { formatNumber } from '@/lib/format';
import { formatResponseTime } from '../../utils';

export interface RequestLogsOverviewCardsProps {
    data?: RequestLogResponsePaginatedDto;
    isLoading?: boolean;
}

export function RequestLogsOverviewCards({
    data,
    isLoading,
}: Readonly<RequestLogsOverviewCardsProps>) {
    const totalItems = data ? data.metadata.totalItems : 0;
    const logs = data?.data ?? [];

    const totalErrors = logs.filter((l) => l.statusCode >= 400).length;
    const totalSuccess = logs.filter(
        (l) => l.statusCode >= 200 && l.statusCode < 400,
    ).length;

    const avgResponseTime =
        logs.length > 0
            ? logs.reduce((acc, curr) => acc + curr.responseTime, 0) /
              logs.length
            : 0;

    const successRate =
        logs.length > 0 ? Math.round((totalSuccess / logs.length) * 100) : 100;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Total Logs Count"
                value={isLoading ? '...' : formatNumber(totalItems)}
                description="Total matching request records"
                icon={Activity}
            />
            <StatCard
                title="Avg Latency"
                value={isLoading ? '...' : formatResponseTime(avgResponseTime)}
                description="Average duration on current page"
                icon={Clock}
            />
            <StatCard
                title="Success Rate"
                value={isLoading ? '...' : `${String(successRate)}%`}
                description={`${formatNumber(totalSuccess)} successful requests`}
                icon={CheckCircle2}
                valueClassName={
                    successRate < 95
                        ? 'text-amber-500'
                        : 'text-emerald-600 dark:text-emerald-400'
                }
            />
            <StatCard
                title="Error Count"
                value={isLoading ? '...' : formatNumber(totalErrors)}
                description={`${formatNumber(totalErrors)} 4xx / 5xx on page`}
                icon={AlertTriangle}
                valueClassName={
                    totalErrors > 0 ? 'text-rose-500' : 'text-foreground'
                }
            />
        </div>
    );
}
