import {
    Activity,
    AlertCircle,
    AlertOctagon,
    AlertTriangle,
} from 'lucide-react';
import type { GetErrorOptions } from '@hitapi/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPeriodDescription } from '@/lib/utils';
import { useErrorMetricsQuery } from '../../hooks';

interface ErrorMetricsCardsProps {
    readonly options: Partial<GetErrorOptions>;
}

export function ErrorMetricsCards({ options }: ErrorMetricsCardsProps) {
    const { data: metrics, isLoading } = useErrorMetricsQuery(options);

    if (isLoading) {
        return (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((key) => (
                    <Card key={key} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="h-3 w-24 rounded bg-muted" />
                            <div className="h-4 w-4 rounded bg-muted" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-7 w-16 rounded bg-muted" />
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Total Requests
                    </CardTitle>
                    <Activity
                        className="h-3.5 w-3.5 text-muted-foreground"
                        aria-hidden="true"
                    />
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="text-2xl font-semibold tabular-nums tracking-tight">
                        {totalRequests.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        {formatPeriodDescription(options.period)}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Total Errors
                    </CardTitle>
                    <AlertTriangle
                        className="h-3.5 w-3.5 text-muted-foreground"
                        aria-hidden="true"
                    />
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="text-2xl font-semibold tabular-nums tracking-tight">
                        {totalErrors.toLocaleString()}
                    </div>
                    <div
                        className={`text-[11px] ${errorRate > 5 ? 'text-destructive' : 'text-muted-foreground'}`}
                    >
                        {errorRate}% error rate · 4xx &amp; 5xx
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Client Errors (4xx)
                    </CardTitle>
                    <AlertCircle
                        className="h-3.5 w-3.5 text-muted-foreground"
                        aria-hidden="true"
                    />
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="text-2xl font-semibold tabular-nums tracking-tight">
                        {clientErrors.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        Auth, validation &amp; bad requests
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Server Errors (5xx)
                    </CardTitle>
                    <AlertOctagon
                        className="h-3.5 w-3.5 text-muted-foreground"
                        aria-hidden="true"
                    />
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="text-2xl font-semibold tabular-nums tracking-tight">
                        {serverErrors.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        Crashes &amp; unexpected faults
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
