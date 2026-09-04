import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    Check,
    Copy,
    Edit,
    ExternalLink,
    Layers,
    Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { LoadingCards } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { useUiStore } from '@/stores/ui-store';
import { useConsumerQuery, useConsumersTableQuery } from '../hooks';
import { ConsumersChart, EditConsumerDialog } from '../components';
import {
    ConsumerAvatar,
    ConsumersChart,
    EditConsumerDialog,
} from '../components';

interface ConsumerDetailPageProps {
    readonly consumerId: number;
}

const AVATAR_PALETTES = [
    {
        bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    },
    {
        bg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25',
    },
    {
        bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
    },
    {
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
    },
    {
        bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
    },
    {
        bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25',
    },
    {
        bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',
    },
] as const;

function getAvatarPalette(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (str.codePointAt(i) ?? 0) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_PALETTES.length;
    return AVATAR_PALETTES[index];
}

function getInitials(name?: string | null, identifier?: string): string {
    const raw = name || identifier || '?';
    const parts = raw.split(/[\s_-]+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return raw.slice(0, 2).toUpperCase();
}

export function ConsumerDetailPage({ consumerId }: ConsumerDetailPageProps) {
    const activeAppId = useUiStore((s) => s.activeAppId) ?? '';
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const consumerQuery = useConsumerQuery(activeAppId, consumerId);
    const consumer = consumerQuery.data;

    const tableQuery = useConsumersTableQuery({
        appId: activeAppId,
        consumerId,
    });
    const consumerTraffic = tableQuery.data?.[0];

    const handleCopy = (identifier: string) => {
        void navigator.clipboard.writeText(identifier);
        setCopied(true);
        toast.success(`Copied "${identifier}" to clipboard`);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    if (consumerQuery.isLoading) {
        return <LoadingCards count={4} />;
    }

    if (consumerQuery.isError || !consumer) {
        return (
            <ErrorState
                error={consumerQuery.error ?? new Error('Consumer not found')}
                onRetry={() => {
                    void consumerQuery.refetch();
                }}
            />
        );
    }

    const displayName = consumer.name || consumer.identifier;
    const initials = getInitials(consumer.name, consumer.identifier);
    const palette = getAvatarPalette(consumer.identifier);
    const hasDistinctName =
        Boolean(consumer.name) && consumer.name !== consumer.identifier;

    return (
        <div className="space-y-6">
            {/* Top Navigation */}
            <div className="flex items-center gap-2">
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                    <Link
                        to="/consumers"
                        search={{ appId: activeAppId || undefined }}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to Consumers</span>
                    </Link>
                </Button>
            </div>

            {/* Page Header */}
            <PageHeader
                title={
                    <div className="flex items-center gap-3.5">
                        <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold shadow-xs ${palette.bg}`}
                        >
                            {initials}
                        </div>
                        <ConsumerAvatar
                            name={consumer.name}
                            identifier={consumer.identifier}
                            size="lg"
                        />
                        <div>
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl font-bold tracking-tight">
                                    {displayName}
                                </span>
                                {consumer.group ? (
                                    <Badge
                                        variant="secondary"
                                        className="gap-1 font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                                    >
                                        <Layers className="h-3 w-3" />
                                        {consumer.group.name}
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="text-xs text-muted-foreground"
                                    >
                                        Unassigned
                                    </Badge>
                                )}
                            </div>
                            {hasDistinctName ? (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="font-mono text-xs text-muted-foreground">
                                        @{consumer.identifier}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                }
                description="Traffic telemetry and reliability metrics recorded for this client."
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs font-semibold"
                            onClick={() => {
                                setEditDialogOpen(true);
                            }}
                        >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Edit Consumer</span>
                        </Button>
                    </div>
                }
            />

            {/* Top Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* Identifier Card */}
                <Card className="border-border/60 shadow-xs bg-linear-to-br from-card to-card/60">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5">
                                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Client Identifier</span>
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    handleCopy(consumer.identifier);
                                }}
                                title="Copy identifier"
                            >
                                {copied ? (
                                    <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                    <Copy className="h-3 w-3" />
                                )}
                            </Button>
                        </CardDescription>
                        <CardTitle className="font-mono text-sm break-all pt-1 font-semibold text-foreground">
                            {consumer.identifier}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-[11px] text-muted-foreground">
                            Unique ID used for authentication & telemetry
                            tracking
                        </p>
                    </CardContent>
                </Card>

                {/* Consumer Group Card */}
                <Card className="border-border/60 shadow-xs bg-linear-to-br from-card to-card/60">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5">
                                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Consumers Group</span>
                            </span>
                            {consumer.group && activeAppId && (
                                <Link
                                    to="/consumers"
                                    search={{
                                        appId: activeAppId,
                                        groupId: String(consumer.group.id),
                                    }}
                                    className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5"
                                >
                                    <span>Filter</span>
                                    <ExternalLink className="h-2.5 w-2.5" />
                                </Link>
                            )}
                        </CardDescription>
                        <CardTitle className="text-sm pt-1 font-semibold">
                            {consumer.group ? (
                                <Badge
                                    variant="secondary"
                                    className="gap-1 font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                                >
                                    <Layers className="h-3 w-3" />
                                    {consumer.group.name}
                                </Badge>
                            ) : (
                                <span className="text-muted-foreground text-sm font-normal">
                                    No group assigned
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-[11px] text-muted-foreground">
                            {consumer.group
                                ? 'Client belongs to this group'
                                : 'You can assign this client to a group'}
                        </p>
                    </CardContent>
                </Card>

                {/* Total Requests Card */}
                <Card className="border-border/60 shadow-xs bg-linear-to-br from-card to-card/60">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5">
                                <Activity className="h-3.5 w-3.5 text-primary" />
                                <span>Total Requests</span>
                            </span>
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold font-mono tracking-tight text-foreground pt-1">
                            {consumerTraffic?.requests !== undefined
                                ? consumerTraffic.requests.toLocaleString()
                                : '0'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-[11px] text-muted-foreground">
                            Total API requests recorded from this client
                        </p>
                    </CardContent>
                </Card>

                {/* Error Rate Card */}
                <Card className="border-border/60 shadow-xs bg-linear-to-br from-card to-card/60">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                <span>Error Rate</span>
                            </span>
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold font-mono tracking-tight pt-1">
                            {consumerTraffic &&
                            consumerTraffic.errorRate > 0 ? (
                                <span className="text-amber-600 dark:text-amber-400">
                                    {consumerTraffic.errorRate.toFixed(1)}%
                                </span>
                            ) : (
                                <span className="text-foreground">0%</span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-[11px] text-muted-foreground">
                            Percentage of failed responses (4xx/5xx)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Traffic Activity Chart for this Consumer */}
            {activeAppId && (
                <ConsumersChart appId={activeAppId} consumerId={consumer.id} />
            )}

            {/* Controlled Edit Consumer Dialog (no stray trigger in DOM) */}
            {activeAppId && (
                <EditConsumerDialog
                    appId={activeAppId}
                    consumer={consumer}
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                />
            )}
        </div>
    );
}
