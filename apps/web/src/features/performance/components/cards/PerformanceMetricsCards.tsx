import { Activity, Award, Clock, Sliders, Timer, Zap } from 'lucide-react';
import type { GetPerformanceOptions } from '@hitapi/types';
import { MetricsCardsSkeleton, StatCard } from '@/components/common';
import { formatNumber } from '@/lib/format';
import { formatPeriodDescription } from '@/lib/utils';
import { usePerformanceMetricsQuery } from '../../hooks';
import { formatApdex, formatResponseTime, getApdexRating } from '../../utils';

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
        return <MetricsCardsSkeleton count={6} />;
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
            <StatCard
                title="Total Requests"
                value={formatNumber(totalRequests)}
                description={formatPeriodDescription(options.period)}
                icon={Activity}
            />

            <StatCard
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

            <StatCard
                title="Median (P50)"
                value={formatResponseTime(responseTimeP50)}
                description="50% of requests faster"
                icon={Clock}
            />

            <StatCard
                title="P75 Latency"
                value={formatResponseTime(responseTimeP75)}
                description="75% of requests faster"
                icon={Timer}
            />

            <StatCard
                title="P95 Latency"
                value={formatResponseTime(responseTimeP95)}
                description="95% of requests faster"
                icon={Zap}
                valueClassName={getP95ColorClass(
                    responseTimeP95,
                    targetResponseTimeMs,
                )}
            />

            <StatCard
                title="Target Time"
                value={formatResponseTime(targetResponseTimeMs)}
                description="Apdex target threshold"
                icon={Sliders}
            />
        </div>
    );
}
