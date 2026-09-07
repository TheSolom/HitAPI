import {
    Activity,
    AlertCircle,
    AlertOctagon,
    AlertTriangle,
} from 'lucide-react';
import type { GetErrorOptions } from '@hitapi/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPeriodDescription } from '@/lib/utils';
import { useErrorMetricsQuery } from '../../hooks';

interface ErrorMetricsCardsProps {
    readonly options: Partial<GetErrorOptions>;
}

export function ErrorMetricsCards({ options }: ErrorMetricsCardsProps) {
    const { data: metrics, isLoading } = useErrorMetricsQuery(options);

    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((key) => (
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

    const totalRequests = metrics?.totalRequestCount ?? 0;
    const totalErrors = metrics?.totalErrorCount ?? 0;
    const clientErrors = metrics?.clientErrorCount ?? 0;
    const serverErrors = metrics?.serverErrorCount ?? 0;
    const errorRate = metrics?.errorRate ?? 0;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Requests Card */}
            <Card className="relative overflow-hidden border-border/60 bg-linear-to-br from-card to-card/50 transition-all hover:border-primary/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Requests
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Activity className="h-4 w-4" aria-hidden="true" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="text-2xl font-bold tracking-tight">
                        {totalRequests.toLocaleString()}
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        {formatPeriodDescription(options.period)}
                    </CardDescription>
                </CardContent>
            </Card>

            {/* Total Errors Card */}
            <Card className="relative overflow-hidden border-border/60 bg-linear-to-br from-card to-card/50 transition-all hover:border-rose-500/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Errors
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold tracking-tight">
                            {totalErrors.toLocaleString()}
                        </span>
                        <Badge
                            variant="secondary"
                            className={
                                errorRate > 5
                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-xs px-1.5 py-0 font-medium'
                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs px-1.5 py-0 font-medium'
                            }
                        >
                            {errorRate}% error rate
                        </Badge>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        Combined 4xx &amp; 5xx responses
                    </CardDescription>
                </CardContent>
            </Card>

            {/* Client (4xx) Errors Card */}
            <Card className="relative overflow-hidden border-border/60 bg-linear-to-br from-card to-card/50 transition-all hover:border-amber-500/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Client Errors (4xx)
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="text-2xl font-bold tracking-tight">
                        {clientErrors.toLocaleString()}
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        Bad requests, auth &amp; validation errors
                    </CardDescription>
                </CardContent>
            </Card>

            {/* Server (5xx) Errors Card */}
            <Card className="relative overflow-hidden border-border/60 bg-linear-to-br from-card to-card/50 transition-all hover:border-destructive/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Server Errors (5xx)
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                        <AlertOctagon className="h-4 w-4" aria-hidden="true" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="text-2xl font-bold tracking-tight">
                        {serverErrors.toLocaleString()}
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        Internal crashes &amp; unexpected faults
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}
