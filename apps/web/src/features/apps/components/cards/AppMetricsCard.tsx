import { Link } from '@tanstack/react-router';
import { Activity, AlertTriangle, Gauge, Users } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useUiStore } from '@/stores/ui-store';
import { formatPeriodDescription } from '@/lib/utils';
import { useAppMetricsQuery } from '../../hooks';

interface AppMetricsCardProps {
    readonly appId: string;
    readonly period?: string;
}

const SKELETON_ITEMS = [1, 2, 3, 4] as const;

export function AppMetricsCard({ appId, period }: AppMetricsCardProps) {
    const storePeriod = useUiStore((s) => s.period);
    const effectivePeriod = period ?? storePeriod;
    const { data, isLoading, isError } = useAppMetricsQuery(appId, {
        period: effectivePeriod,
    });
    const metrics = data?.data;

    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {SKELETON_ITEMS.map((key) => (
                    <Card key={key} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="h-4 w-24 rounded bg-muted" />
                            <div className="h-4 w-4 rounded bg-muted" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-16 rounded bg-muted" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (isError || !metrics) {
        return null;
    }

    const requestCountFormatted = metrics.requestCount.toLocaleString();
    const errorRateFormatted = `${metrics.errorRate.toFixed(2)}%`;
    const apdexScoreFormatted = metrics.apdexScore.toFixed(2);
    const consumerCountFormatted = metrics.consumerCount.toLocaleString();


    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Requests
                    </CardTitle>
                    <Activity
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                    />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {requestCountFormatted}
                    </div>
                    <CardDescription className="text-xs">
                        {formatPeriodDescription(effectivePeriod)}
                    </CardDescription>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Error Rate
                    </CardTitle>
                    <AlertTriangle
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                    />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {errorRateFormatted}
                    </div>
                    <CardDescription className="text-xs">
                        Client and server errors
                    </CardDescription>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Apdex Score
                    </CardTitle>
                    <Gauge
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                    />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {apdexScoreFormatted}
                    </div>
                    <CardDescription className="text-xs">
                        Application Performance Index
                    </CardDescription>
                </CardContent>
            </Card>

            <Link
                to="/consumers"
                search={{ appId: appId }}
                className="block transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
                <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/10 cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Consumers
                        </CardTitle>
                        <Users
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                        />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {consumerCountFormatted}
                        </div>
                        <CardDescription className="text-xs flex items-center justify-between">
                            <span>Unique clients seen</span>
                            <span className="text-[10px] text-primary font-medium hover:underline">
                                View all &rarr;
                            </span>
                        </CardDescription>
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
}
