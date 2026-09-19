import { useEffect } from 'react';
import type { Period } from '@hitapi/types';
import type { RestfulMethod } from '@hitapi/shared/enums';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/states/EmptyState';
import { useUiStore } from '@/stores/ui-store';
import {
    PerformanceMetricsCards,
    ApdexScoreChart,
    ResponseTimeChart,
    PerformanceEndpointsTable,
} from '../components';

export interface PerformancePageProps {
    appId?: string;
    period?: Period;
    consumerId?: number;
    consumerGroupId?: number;
    method?: RestfulMethod;
    path?: string;
    statusCode?: string;
}

export function PerformancePage({
    appId,
    period: initialPeriod,
    consumerId,
    consumerGroupId,
    method,
    path,
    statusCode,
}: Readonly<PerformancePageProps>) {
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
                    title="Performance Analytics"
                    description="Monitor response times, latency percentiles, user satisfaction (Apdex), and endpoint performance."
                />
                <EmptyState
                    title="No application selected"
                    description="Please select or create an application from the top bar to inspect its performance metrics."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Performance Analytics"
                description="Real-time monitoring of response times, latency percentiles (P50/P75/P95), and user satisfaction (Apdex score)."
            />

            {/* KPI Metrics Cards */}
            <section aria-label="Performance Metrics Overview">
                <PerformanceMetricsCards options={queryOptions} />
            </section>

            {/* Charts: Apdex Score & Response Time Percentiles */}
            <section
                aria-label="Latency and User Satisfaction Charts"
                className="grid gap-6 lg:grid-cols-2"
            >
                <ApdexScoreChart options={queryOptions} />
                <ResponseTimeChart options={queryOptions} />
            </section>

            {/* Endpoints Table */}
            <section
                aria-label="Endpoint Performance Breakdown"
                className="space-y-3"
            >
                <div className="flex flex-col gap-1">
                    <h2 className="text-base font-semibold tracking-tight text-foreground">
                        Endpoints Breakdown
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Granular performance metrics per HTTP route including
                        volume, latency percentiles, and Apdex user satisfaction
                        score.
                    </p>
                </div>
                <PerformanceEndpointsTable options={queryOptions} />
            </section>
        </div>
    );
}
