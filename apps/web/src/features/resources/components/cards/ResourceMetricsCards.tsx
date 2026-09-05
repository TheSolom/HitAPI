import { Cpu, HardDrive, Zap, Database } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useResourceMetricsQuery } from '../../hooks';
import { formatBytes, formatCpuPercent } from '../../utils';

interface ResourceMetricsCardsProps {
    readonly appId: string;
}

export function ResourceMetricsCards({ appId }: ResourceMetricsCardsProps) {
    const { data: metrics, isLoading } = useResourceMetricsQuery(appId);

    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((key) => (
                    <Card key={key} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="h-4 w-24 rounded bg-muted" />
                            <div className="h-4 w-4 rounded bg-muted" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="h-8 w-20 rounded bg-muted" />
                            <div className="h-3 w-28 rounded bg-muted" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const cpuAvg = metrics?.cpuPercentAvg ?? 0;
    const cpuMin = metrics?.cpuPercentMin ?? 0;
    const cpuMax = metrics?.cpuPercentMax ?? 0;
    const memAvg = metrics?.memoryRssAvg ?? 0;
    const memMin = metrics?.memoryRssMin ?? 0;
    const memMax = metrics?.memoryRssMax ?? 0;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Average CPU Card */}
            <Card className="relative overflow-hidden border-border/60 bg-linear-to-br from-card to-card/50 transition-all hover:border-primary/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Avg CPU Usage
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Cpu className="h-4 w-4" aria-hidden="true" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-1.5">
                    <div className="text-2xl font-bold tracking-tight">
                        {formatCpuPercent(cpuAvg)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Badge
                            variant="secondary"
                            className="bg-muted text-[10px] px-1.5 py-0 font-normal"
                        >
                            Min: {formatCpuPercent(cpuMin)}
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="bg-muted text-[10px] px-1.5 py-0 font-normal"
                        >
                            Max: {formatCpuPercent(cpuMax)}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Peak CPU Card */}
            <Card className="relative overflow-hidden border-border/60 bg-linear-to-br from-card to-card/50 transition-all hover:border-amber-500/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Peak CPU Usage
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Zap className="h-4 w-4" aria-hidden="true" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                        {formatCpuPercent(cpuMax)}
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        Highest recorded CPU consumption
                    </CardDescription>
                </CardContent>
            </Card>

            {/* Average Memory Card */}
            <Card className="relative overflow-hidden border-border/60 bg-linear-to-br from-card to-card/50 transition-all hover:border-violet-500/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Avg Memory RSS
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                        <HardDrive className="h-4 w-4" aria-hidden="true" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-1.5">
                    <div className="text-2xl font-bold tracking-tight">
                        {formatBytes(memAvg)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Badge
                            variant="secondary"
                            className="bg-muted text-[10px] px-1.5 py-0 font-normal"
                        >
                            Min: {formatBytes(memMin)}
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="bg-muted text-[10px] px-1.5 py-0 font-normal"
                        >
                            Max: {formatBytes(memMax)}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Peak Memory Card */}
            <Card className="relative overflow-hidden border-border/60 bg-linear-to-br from-card to-card/50 transition-all hover:border-emerald-500/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Peak Memory RSS
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Database className="h-4 w-4" aria-hidden="true" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                        {formatBytes(memMax)}
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                        Highest resident set size observed
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}
