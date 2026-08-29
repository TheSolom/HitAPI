import { Users, UserPlus, Layers, Activity } from 'lucide-react';
import type { Period } from '@hitapi/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPeriodDescription } from '@/lib/utils';
import { useConsumerMetricsQuery } from '../../hooks';

interface ConsumerMetricsCardsProps {
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

    const totalConsumers = metrics?.totalConsumers ?? 0;
    const newConsumers = metrics?.newConsumers ?? 0;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Consumers Card */}
            <Card className="relative overflow-hidden border-border/60 bg-linear-to-br from-card to-card/50 transition-all hover:border-primary/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Consumers
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Users className="h-4 w-4" aria-hidden="true" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="text-2xl font-bold tracking-tight">
                        {totalConsumers.toLocaleString()}
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        Registered API consumers
                    </CardDescription>
                </CardContent>
            </Card>

            {/* New Consumers Card */}
            <Card className="relative overflow-hidden border-border/60 bg-linear-to-br from-card to-card/50 transition-all hover:border-emerald-500/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        New Consumers
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <UserPlus className="h-4 w-4" aria-hidden="true" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold tracking-tight">
                            {newConsumers.toLocaleString()}
                        </span>
                        {newConsumers > 0 && (
                            <Badge
                                variant="secondary"
                                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs px-1.5 py-0 font-medium"
                            >
                                +{newConsumers} new
                            </Badge>
                        )}
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        {formatPeriodDescription(period)}
                    </CardDescription>
                </CardContent>
            </Card>

            {/* Consumer Groups Card */}
            <Card className="relative overflow-hidden border-border/60 bg-linear-to-br from-card to-card/50 transition-all hover:border-violet-500/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Consumer Groups
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                        <Layers className="h-4 w-4" aria-hidden="true" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="text-2xl font-bold tracking-tight">
                        {totalGroups.toLocaleString()}
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        Segmented client cohorts
                    </CardDescription>
                </CardContent>
            </Card>

            {/* SDK Activity / Overview Card */}
            <Card className="relative overflow-hidden border-border/60 bg-linear-to-br from-card to-card/50 transition-all hover:border-amber-500/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Identification Status
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Activity className="h-4 w-4" aria-hidden="true" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="text-2xl font-bold tracking-tight">
                        {totalConsumers > 0 ? 'Active' : 'Awaiting Data'}
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        {totalConsumers > 0
                            ? 'Consumers reporting to Hub'
                            : 'Set identifier in HitAPI SDK'}
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}
