import { useEffect } from 'react';
import type { Period } from '@hitapi/types';
import type { RestfulMethod } from '@hitapi/shared/enums';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/states/EmptyState';
import { useUiStore } from '@/stores/ui-store';
import { ErrorRatesChart } from '@/features/errors';
import {
    TrafficMetricsCards,
    RequestsChart,
    RequestsPerMinuteChart,
    DataTransferredChart,
    TrafficEndpointsTable,
} from '../components';

export interface TrafficPageProps {
    appId?: string;
    period?: Period;
    consumerId?: number;
    consumerGroupId?: number;
    method?: RestfulMethod;
    path?: string;
    statusCode?: string;
}

export function TrafficPage({
    appId,
    period: initialPeriod,
    consumerId,
    consumerGroupId,
    method,
    path,
    statusCode,
}: Readonly<TrafficPageProps>) {
    const activeAppId = useUiStore((s) => s.activeAppId);
    const setActiveAppId = useUiStore((s) => s.setActiveAppId);
    const storePeriod = useUiStore((s) => s.period);

    // Sync appId from route if provided
    useEffect(() => {
        if (appId && activeAppId !== appId) {
            setActiveAppId(appId);
        }
    }, [appId, activeAppId, setActiveAppId]);

    const resolvedAppId = appId ?? activeAppId ?? '';
    const resolvedPeriod = initialPeriod ?? storePeriod;

    const queryOptions = {
        appId: resolvedAppId,
        period: resolvedPeriod,
        consumerId,
        consumerGroupId,
        method,
        path,
        statusCode,
    };

    if (!resolvedAppId) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Traffic Analytics"
                    description="Monitor incoming request volume, throughput, network transfer, and endpoint breakdowns."
                />
                <EmptyState
                    title="No application selected"
                    description="Please select or create an application from the top bar to inspect its traffic metrics."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Traffic Analytics"
                description="Real-time monitoring of request volume, throughput, data transfer, and endpoint health."
            />

            {/* KPI Metrics Cards */}
            <section aria-label="Traffic Metrics Overview">
                <TrafficMetricsCards options={queryOptions} />
            </section>

            {/* Primary Charts: Requests Breakdown & Throughput RPM */}
            <section
                aria-label="Request Volume and Throughput"
                className="grid gap-6 lg:grid-cols-2"
            >
                <RequestsChart options={queryOptions} />
                <RequestsPerMinuteChart options={queryOptions} />
            </section>

            {/* Secondary Charts: Network Payload & Error Rates Trend */}
            <section
                aria-label="Data Transferred and Error Rates"
                className="grid gap-6 lg:grid-cols-2"
            >
                <DataTransferredChart options={queryOptions} />
                <ErrorRatesChart options={queryOptions} />
            </section>

            {/* Endpoints Table */}
            <section
                aria-label="Endpoint Traffic Breakdown"
                className="space-y-3"
            >
                <div className="flex flex-col gap-1">
                    <h2 className="text-base font-semibold tracking-tight text-foreground">
                        Endpoints Breakdown
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Granular metrics per HTTP route including volume, error
                        rates, and data payload transferred.
                    </p>
                </div>
                <TrafficEndpointsTable options={queryOptions} />
            </section>
        </div>
    );
}
