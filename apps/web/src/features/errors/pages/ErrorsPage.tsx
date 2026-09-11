import { useEffect, useState } from 'react';
import {
    AlertCircle,
    AlertOctagon,
    AlertTriangle,
    BarChart3,
} from 'lucide-react';
import type { Period } from '@hitapi/types';
import type { RestfulMethod } from '@hitapi/shared/enums';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/states/EmptyState';
import { useUiStore } from '@/stores/ui-store';
import {
    useErrorMetricsQuery,
    useValidationErrorsTableQuery,
    useServerErrorsTableQuery,
} from '../hooks';
import {
    ErrorMetricsCards,
    ErrorsChart,
    ErrorRatesChart,
    ErrorsByConsumerChart,
    ErrorsTable,
    ValidationErrorsTable,
    ServerErrorsTable,
} from '../components';

export type ErrorsTab = 'overview' | 'validation' | 'server';

export interface ErrorsPageProps {
    readonly appId?: string;
    readonly period?: Period;
    readonly tab?: ErrorsTab;
    readonly consumerId?: number;
    readonly consumerGroupId?: number;
    readonly method?: RestfulMethod;
    readonly path?: string;
    readonly statusCode?: string;
}

export function ErrorsPage({
    appId,
    period: initialPeriod,
    tab: initialTab = 'overview',
    consumerId,
    consumerGroupId,
    method,
    path,
    statusCode,
}: ErrorsPageProps) {
    const activeAppId = useUiStore((s) => s.activeAppId);
    const setActiveAppId = useUiStore((s) => s.setActiveAppId);
    const storePeriod = useUiStore((s) => s.period);

    // Sync appId from search params if provided
    useEffect(() => {
        if (appId && activeAppId !== appId) {
            setActiveAppId(appId);
        }
    }, [appId, activeAppId, setActiveAppId]);

    const resolvedAppId = appId ?? activeAppId ?? '';
    const resolvedPeriod = initialPeriod ?? storePeriod;

    const [activeTab, setActiveTab] = useState<ErrorsTab>(initialTab);

    const queryOptions = {
        appId: resolvedAppId,
        period: resolvedPeriod,
        consumerId,
        consumerGroupId,
        method,
        path,
        statusCode,
    };

    const metricsQuery = useErrorMetricsQuery(queryOptions);
    const validationQuery = useValidationErrorsTableQuery({
        appId: resolvedAppId,
        period: resolvedPeriod,
        consumerId,
        consumerGroupId,
        method,
        path,
    });
    const serverErrorsQuery = useServerErrorsTableQuery({
        appId: resolvedAppId,
        period: resolvedPeriod,
        consumerId,
        consumerGroupId,
        method,
        path,
    });

    const totalErrors = metricsQuery.data?.totalErrorCount ?? 0;
    const validationCount = validationQuery.data?.length ?? 0;
    const serverCount = serverErrorsQuery.data?.length ?? 0;

    if (!resolvedAppId) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Errors"
                    description="Monitor failed requests, error rates, schema validation issues, and server exceptions."
                />
                <EmptyState
                    icon={AlertTriangle}
                    title="Select an application"
                    description="Errors and exceptions telemetry are scoped to an application. Please select an app from the top navigation bar."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Errors &amp; Exceptions"
                description="Comprehensive observability into client-side 4xx rejections, schema validation failures, and unhandled server crashes."
            />

            <Tabs
                value={activeTab}
                onValueChange={(val) => {
                    setActiveTab(val as ErrorsTab);
                }}
                className="space-y-6"
            >
                <div className="flex items-center justify-between border-b pb-2">
                    <TabsList className="h-9 bg-muted/60 p-1">
                        <TabsTrigger
                            value="overview"
                            className="gap-2 text-xs sm:text-sm data-[state=active]:bg-background"
                        >
                            <BarChart3 className="h-3.5 w-3.5" />
                            <span>Overview &amp; Endpoints</span>
                            {totalErrors > 0 && (
                                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
                                    {totalErrors.toLocaleString()}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="validation"
                            className="gap-2 text-xs sm:text-sm data-[state=active]:bg-background"
                        >
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>Validation Errors</span>
                            {validationCount > 0 && (
                                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
                                    {validationCount.toLocaleString()}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="server"
                            className="gap-2 text-xs sm:text-sm data-[state=active]:bg-background"
                        >
                            <AlertOctagon className="h-3.5 w-3.5" />
                            <span>Server Exceptions</span>
                            {serverCount > 0 && (
                                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
                                    {serverCount.toLocaleString()}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Tab: Overview */}
                <TabsContent value="overview" className="m-0 space-y-6">
                    {/* KPI Metrics */}
                    <ErrorMetricsCards options={queryOptions} />

                    {/* Primary Error Volume Timeline */}
                    <ErrorsChart options={queryOptions} />

                    {/* Secondary Breakdown Charts: Rates & Affected Consumers */}
                    {totalErrors > 0 && (
                        <div className="grid gap-6 lg:grid-cols-2">
                            <ErrorRatesChart options={queryOptions} />
                            <ErrorsByConsumerChart options={queryOptions} />
                        </div>
                    )}

                    {/* HTTP Errors Table */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-foreground">
                            Failed Endpoints Breakdown
                        </h3>
                        <ErrorsTable options={queryOptions} />
                    </div>
                </TabsContent>

                {/* Tab: Validation Errors */}
                <TabsContent value="validation" className="m-0 space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-foreground">
                            Payload &amp; Parameter Validation Failures
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Schema violations rejected at framework level (422 /
                            400 Bad Request)
                        </p>
                        <ValidationErrorsTable
                            options={{
                                appId: resolvedAppId,
                                period: resolvedPeriod,
                                consumerId,
                                consumerGroupId,
                                method,
                                path,
                            }}
                        />
                    </div>
                </TabsContent>

                {/* Tab: Server Exceptions */}
                <TabsContent value="server" className="m-0 space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-foreground">
                            Unhandled 5xx Server Crashes
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Runtime exceptions and uncaught server errors
                            captured with stack trace context
                        </p>
                        <ServerErrorsTable
                            options={{
                                appId: resolvedAppId,
                                period: resolvedPeriod,
                                consumerId,
                                consumerGroupId,
                                method,
                                path,
                            }}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
