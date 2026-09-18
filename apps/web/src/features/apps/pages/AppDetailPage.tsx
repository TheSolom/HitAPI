import { PageHeader } from '@/components/layout/PageHeader';
import { ActiveStatusBadge } from '@/components/common';
import { LoadingCards } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { useAppQuery } from '../hooks';
import {
    AppConfigCard,
    AppMetricsCard,
    EditAppDialog,
    DeleteAppDialog,
} from '../components';

interface AppDetailPageProps {
    appId: string;
}

export function AppDetailPage({ appId }: Readonly<AppDetailPageProps>) {
    const appQuery = useAppQuery(appId);
    const app = appQuery.data?.data;

    if (appQuery.isLoading) {
        return <LoadingCards />;
    }

    if (appQuery.isError || !app) {
        return (
            <ErrorState
                error={appQuery.error ?? new Error('App not found')}
                onRetry={() => {
                    void appQuery.refetch();
                }}
            />
        );
    }

    const headerActions = (
        <div className="flex items-center gap-2">
            <EditAppDialog app={app} />
            <DeleteAppDialog appId={app.id} appName={app.name} redirectToApps />
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        <span>{app.name}</span>
                        <ActiveStatusBadge active={app.active} />
                    </div>
                }
                description="Application configuration, key metrics, and monitoring data."
                actions={headerActions}
            />

            <div className="space-y-6">
                <section aria-labelledby="app-metrics-heading">
                    <h2 id="app-metrics-heading" className="sr-only">
                        Application Metrics
                    </h2>
                    <AppMetricsCard appId={appId} />
                </section>

                <section aria-labelledby="app-config-heading">
                    <h2 id="app-config-heading" className="sr-only">
                        Application Configuration
                    </h2>
                    <AppConfigCard app={app} />
                </section>
            </div>
        </div>
    );
}
