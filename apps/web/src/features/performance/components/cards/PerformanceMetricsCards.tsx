import { Activity, Award, Clock, Sliders, Timer, Zap } from 'lucide-react';
import type { GetPerformanceOptions } from '@hitapi/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatPeriodDescription } from '@/lib/utils';
import { usePerformanceMetricsQuery } from '../../hooks';
import {
    formatApdex,
    formatNumber,
    formatResponseTime,
    getApdexRating,
} from '../../utils';
import { PerformanceStatCard } from './PerformanceStatCard';

export interface PerformanceMetricsCardsProps {
    options: Partial<GetPerformanceOptions>;
}

function getP95ColorClass(p95: number, targetMs: number): string | undefined {
    if (p95 > targetMs * 4) return 'text-destructive';
    if (p95 > targetMs) return 'text-amber-500';
    return undefined;
}

export function PerformanceMetricsCards({
    options,
}: Readonly<PerformanceMetricsCardsProps>) {
    const { data: metrics, isLoading } = usePerformanceMetricsQuery(options);

    if (isLoading) {
        return (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {[1, 2, 3, 4, 5, 6].map((key) => (
                    <Card key={key} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="h-3 w-20 rounded bg-muted" />
                            <div className="h-4 w-4 rounded bg-muted" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="h-7 w-16 rounded bg-muted" />
                            <div className="h-3 w-24 rounded bg-muted" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const totalRequests = metrics?.totalRequestCount ?? 0;
    const apdexScore = metrics?.apdexScore ?? 0;
    const responseTimeP50 = metrics?.responseTimeP50 ?? 0;
    const responseTimeP75 = metrics?.responseTimeP75 ?? 0;
    const responseTimeP95 = metrics?.responseTimeP95 ?? 0;
    const targetResponseTimeMs = metrics?.targetResponseTimeMs ?? 500;

    const apdexRating = getApdexRating(apdexScore);

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <PerformanceStatCard
                title="Total Requests"
                value={formatNumber(totalRequests)}
                description={formatPeriodDescription(options.period)}
                icon={Activity}
            />

            <PerformanceStatCard
                title="Apdex Score"
                value={formatApdex(apdexScore)}
                description={
                    <span className={apdexRating.colorClass}>
                        {apdexRating.label} rating
                    </span>
                }
                icon={Award}
                valueClassName={apdexRating.colorClass}
            />

            <PerformanceStatCard
                title="Median (P50)"
                value={formatResponseTime(responseTimeP50)}
                description="50% of requests faster"
                icon={Clock}
            />

            <PerformanceStatCard
                title="P75 Latency"
                value={formatResponseTime(responseTimeP75)}
                description="75% of requests faster"
                icon={Timer}
            />

            <PerformanceStatCard
                title="P95 Latency"
                value={formatResponseTime(responseTimeP95)}
                description="95% of requests faster"
                icon={Zap}
                valueClassName={getP95ColorClass(
                    responseTimeP95,
                    targetResponseTimeMs,
                )}
            />

            <PerformanceStatCard
                title="Target Time"
                value={formatResponseTime(targetResponseTimeMs)}
                description="Apdex target threshold"
                icon={Sliders}
            />
        </div>
    );
}
