import type { Period } from '@hitapi/types';
import type { RestfulMethod } from '@hitapi/shared/enums';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/states/EmptyState';
import { useAnalyticsQueryOptions } from '@/hooks';
import {
    RequestLogsTimelineChart,
    RequestLogsOverviewCards,
    RequestLogsTable,
} from '../components';
import { useRequestLogsQuery } from '../hooks';

export interface RequestLogsPageProps {
    appId?: string;
    period?: Period;
    consumerId?: number;
    consumerGroupId?: number;
    method?: RestfulMethod;
    path?: string;
    statusCode?: string;
}

export function RequestLogsPage({
    appId,
    period: initialPeriod,
    consumerId,
    consumerGroupId,
    method,
    path,
    statusCode,
}: Readonly<RequestLogsPageProps>) {
    const { resolvedAppId, resolvedPeriod, queryOptions } =
        useAnalyticsQueryOptions({
            appId,
            period: initialPeriod,
            consumerId,
            consumerGroupId,
            method,
            path,
            statusCode,
        });

    const summaryLogsQuery = useRequestLogsQuery({
        appId: resolvedAppId,
        period: resolvedPeriod,
        consumerId,
        consumerGroupId,
        method,
        path,
        limit: 50,
        offset: 1,
    });

    if (!resolvedAppId) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Request Logs"
                    description="Real-time searchable request-level telemetry, status codes, latency timelines, and traces."
                />
                <EmptyState
                    title="No application selected"
                    description="Please select or create an application from the top bar to inspect its request logs."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Request Logs"
                description="Real-time searchable request-level telemetry, status codes, latency timelines, and detailed traces."
            />

            {/* Request Timeline Chart (endpoint: request-logs/timeline) */}
            <section aria-label="Request Volume Timeline">
                <RequestLogsTimelineChart options={queryOptions} />
            </section>

            {/* Overview KPI Cards */}
            <section aria-label="Request Logs Telemetry Overview">
                <RequestLogsOverviewCards
                    data={summaryLogsQuery.data}
                    isLoading={summaryLogsQuery.isLoading}
                />
            </section>

            {/* Request Logs Table & CSV Export (endpoints: request-logs & request-logs/export) */}
            <section aria-label="Searchable Request Logs Table">
                <RequestLogsTable
                    appId={resolvedAppId}
                    period={resolvedPeriod}
                    consumerId={consumerId}
                    consumerGroupId={consumerGroupId}
                    initialMethod={method}
                    initialPath={path}
                    initialStatusCode={statusCode}
                />
            </section>
        </div>
    );
}
