import { Link } from '@tanstack/react-router';
import {
    Activity,
    AlertTriangle,
    FileText,
    Gauge,
    Network,
    Users,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    readonly appId: string;
}

export function AppDetailPage({ appId }: AppDetailPageProps) {
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
        <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
                <Link to="/endpoints" search={{ appId: appId }}>
                    <Network className="mr-2 h-4 w-4" aria-hidden="true" />
                    Endpoints
                </Link>
            </Button>
            <Button asChild variant="outline">
                <Link to="/consumers" search={{ appId: appId }}>
                    <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                    Consumers
                </Link>
            </Button>
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
                        <Badge
                            variant={app.active ? 'default' : 'secondary'}
                            className={
                                app.active
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 gap-1.5 font-medium'
                                    : 'gap-1.5 font-medium'
                            }
                        >
                            <span
                                className={
                                    app.active
                                        ? 'h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse'
                                        : 'h-1.5 w-1.5 rounded-full bg-muted-foreground'
                                }
                            />
                            {app.active ? 'Active' : 'Inactive'}
                        </Badge>
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

                <section aria-labelledby="app-monitoring-heading">
                    <h2 id="app-monitoring-heading" className="sr-only">
                        Monitoring & Analytics
                    </h2>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Monitoring Dashboards
                            </CardTitle>
                            <CardDescription>
                                Deep-dive analytics and request telemetry for{' '}
                                {app.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            <Button asChild variant="outline" size="sm">
                                <Link to="/traffic">
                                    <Activity className="mr-2 h-4 w-4" />
                                    Traffic Analytics
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link to="/errors">
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Error Logs
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link to="/performance">
                                    <Gauge className="mr-2 h-4 w-4" />
                                    Performance & Apdex
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link to="/consumers" search={{ appId: appId }}>
                                    <Users className="mr-2 h-4 w-4" />
                                    Consumers & Groups
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link to="/logs">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Request Logs
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}
