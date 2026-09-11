import type { Period } from '@hitapi/types';
import { Card } from '@/components/ui/card';
import { formatPeriodDescription } from '@/lib/utils';
import { useConsumerMetricsQuery } from '../../hooks';

export interface ConsumerMetricsCardsProps {
    readonly appId: string;
    readonly period?: Period;
    readonly totalGroups?: number;
}

export function ConsumerMetricsCards({
    appId,
    period,
    totalGroups = 0,
}: ConsumerMetricsCardsProps) {
    const { data: metrics, isLoading } = useConsumerMetricsQuery(appId, period);

    if (isLoading) {
        return (
            <div className="grid gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((key) => (
                    <Card key={key} className="animate-pulse p-4 space-y-2">
                        <div className="h-3 w-24 rounded bg-muted" />
                        <div className="h-7 w-16 rounded bg-muted" />
                        <div className="h-3 w-32 rounded bg-muted" />
                    </Card>
                ))}
            </div>
        );
    }

    const totalConsumers = metrics?.totalConsumers ?? 0;
    const newConsumers = metrics?.newConsumers ?? 0;

    return (
        <div className="grid gap-3 sm:grid-cols-3">
            {/* Total Consumers */}
            <Card className="p-4 space-y-1">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Total Consumers
                </div>
                <div className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                    {totalConsumers.toLocaleString()}
                </div>
                <div className="text-[11px] text-muted-foreground">
                    Registered API consumers
                </div>
            </Card>

            {/* New Consumers */}
            <Card className="p-4 space-y-1">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    New Consumers
                </div>
                <div className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                    {newConsumers.toLocaleString()}
                </div>
                <div className="text-[11px] text-muted-foreground">
                    {formatPeriodDescription(period)}
                </div>
            </Card>

            {/* Consumer Groups */}
            <Card className="p-4 space-y-1">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Consumer Groups
                </div>
                <div className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                    {totalGroups.toLocaleString()}
                </div>
                <div className="text-[11px] text-muted-foreground">
                    Segmented client groups
                </div>
            </Card>
        </div>
    );
}
