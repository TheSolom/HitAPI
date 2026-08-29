import { useEffect, useState } from 'react';
import { Layers, Plus, Search, Users } from 'lucide-react';
import type { ConsumerGroupResponseDto, Period } from '@hitapi/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingRows } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { useUiStore } from '@/stores/ui-store';
import {
    useConsumerGroupsQuery,
    useConsumerMetricsQuery,
} from '../hooks';
import {
    ConsumerGroupCard,
    ConsumerMetricsCards,
    ConsumersChart,
    ConsumersTable,
    CreateConsumerGroupDialog,
    DeleteConsumerGroupDialog,
    EditConsumerGroupDialog,
} from '../components';

interface ConsumersPageProps {
    readonly appId?: string;
    readonly initialGroupId?: string;
    readonly initialTab?: 'consumers' | 'groups';
}

export function ConsumersPage({
    appId,
    initialGroupId,
    initialTab,
}: ConsumersPageProps) {
    const activeAppId = useUiStore((s) => s.activeAppId);
    const setActiveAppId = useUiStore((s) => s.setActiveAppId);
    const period = useUiStore((s) => s.period) as Period;

    // Sync appId from search params if provided
    useEffect(() => {
        if (appId && activeAppId !== appId) {
            setActiveAppId(appId);
        }
    }, [appId, activeAppId, setActiveAppId]);

    const resolvedAppId = appId ?? activeAppId ?? '';

    const [activeTab, setActiveTab] = useState<'consumers' | 'groups'>(
        initialTab ?? 'consumers',
    );
    const [groupSearch, setGroupSearch] = useState('');

    // When initialGroupId is provided, ensure 'consumers' tab is active
    useEffect(() => {
        if (initialGroupId) {
            setActiveTab('consumers');
        }
    }, [initialGroupId]);

    const [selectedGroup, setSelectedGroup] =
        useState<ConsumerGroupResponseDto | null>(null);
    const [editGroupDialogOpen, setEditGroupDialogOpen] = useState(false);
    const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);

    const groupsQuery = useConsumerGroupsQuery(resolvedAppId || undefined);
    const metricsQuery = useConsumerMetricsQuery(resolvedAppId || undefined, period);

    const groups: ConsumerGroupResponseDto[] = groupsQuery.data?.data ?? [];
    const totalConsumers = metricsQuery.data?.totalConsumers ?? 0;

    const filteredGroups = groups.filter((g) => {
        if (!groupSearch.trim()) return true;
        return g.name.toLowerCase().includes(groupSearch.toLowerCase());
    });

    const handleEditGroup = (group: ConsumerGroupResponseDto) => {
        setSelectedGroup(group);
        setEditGroupDialogOpen(true);
    };

    const handleDeleteGroup = (group: ConsumerGroupResponseDto) => {
        setSelectedGroup(group);
        setDeleteGroupDialogOpen(true);
    };

    const renderConsumersTabContent = () => {
        return (
            <div className="space-y-6">
                {/* KPI Metrics */}
                <ConsumerMetricsCards
                    appId={resolvedAppId}
                    period={period}
                    totalGroups={groups.length}
                />

                {/* Consumers Chart (Active Clients Over Time) */}
                <ConsumersChart
                    appId={resolvedAppId}
                    period={period}
                />

                {/* Rich Consumers Table with Search, Filter & Telemetry */}
                <ConsumersTable
                    appId={resolvedAppId}
                    period={period}
                    groups={groups}
                    initialGroupId={initialGroupId}
                />
            </div>
        );
    };

    const renderGroupsTabContent = () => {
        if (groupsQuery.isLoading) {
            return <LoadingRows />;
        }

        if (groupsQuery.isError) {
            return (
                <ErrorState
                    error={groupsQuery.error}
                    onRetry={() => {
                        void groupsQuery.refetch();
                    }}
                />
            );
        }

        if (groups.length === 0) {
            return (
                <EmptyState
                    icon={Layers}
                    title="No consumer groups created"
                    description="Groups allow you to organize clients into cohorts (e.g. VIP, Enterprise, Free Tier) to analyze aggregated traffic."
                    action={
                        resolvedAppId ? (
                            <CreateConsumerGroupDialog
                                appId={resolvedAppId}
                                trigger={
                                    <Button size="sm" className="gap-1.5">
                                        <Plus className="h-4 w-4" />
                                        Create First Group
                                    </Button>
                                }
                            />
                        ) : undefined
                    }
                />
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 sm:max-w-xs">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search groups..."
                            value={groupSearch}
                            onChange={(e) => {
                                setGroupSearch(e.target.value);
                            }}
                            className="pl-8.5 h-9 text-sm"
                        />
                    </div>
                    <CreateConsumerGroupDialog
                        appId={resolvedAppId}
                        trigger={
                            <Button size="sm" className="gap-1.5 h-9">
                                <Plus className="h-4 w-4" />
                                <span>Create Group</span>
                            </Button>
                        }
                    />
                </div>

                {filteredGroups.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                        No groups match &quot;{groupSearch}&quot;
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredGroups.map((group) => (
                            <ConsumerGroupCard
                                key={group.id}
                                appId={resolvedAppId}
                                group={group}
                                onEdit={handleEditGroup}
                                onDelete={handleDeleteGroup}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (!resolvedAppId) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Consumers"
                    description="Identified API clients reported by the SDK, with traffic and error metrics."
                />
                <EmptyState
                    icon={Users}
                    title="Select an application"
                    description="Consumers and groups are scoped to a specific application. Choose an app from the selector in the top bar."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Consumers"
                description="Manage identified API consumers, monitor client activity, and organize cohorts with groups."
            />

            <Tabs
                value={activeTab}
                onValueChange={(val) => {
                    setActiveTab(val as 'consumers' | 'groups');
                }}
                className="space-y-6"
            >
                <div className="flex items-center justify-between border-b pb-2">
                    <TabsList className="h-9 bg-muted/60 p-1">
                        <TabsTrigger
                            value="consumers"
                            className="gap-2 text-xs sm:text-sm data-[state=active]:bg-background"
                        >
                            <Users className="h-3.5 w-3.5" />
                            <span>Consumers</span>
                            {totalConsumers > 0 && (
                                <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                                    {totalConsumers}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="groups"
                            className="gap-2 text-xs sm:text-sm data-[state=active]:bg-background"
                        >
                            <Layers className="h-3.5 w-3.5" />
                            <span>Consumer Groups</span>
                            {groups.length > 0 && (
                                <span className="rounded-full bg-muted-foreground/15 px-1.5 py-0.2 text-[10px] font-semibold text-muted-foreground">
                                    {groups.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="consumers" className="m-0 space-y-6">
                    {renderConsumersTabContent()}
                </TabsContent>

                <TabsContent value="groups" className="m-0 space-y-6">
                    {renderGroupsTabContent()}
                </TabsContent>
            </Tabs>

            <EditConsumerGroupDialog
                appId={resolvedAppId}
                group={selectedGroup}
                open={editGroupDialogOpen}
                onOpenChange={(open) => {
                    setEditGroupDialogOpen(open);
                    if (!open) {
                        setSelectedGroup(null);
                    }
                }}
            />

            <DeleteConsumerGroupDialog
                appId={resolvedAppId}
                group={selectedGroup}
                open={deleteGroupDialogOpen}
                onOpenChange={(open) => {
                    setDeleteGroupDialogOpen(open);
                    if (!open) {
                        setSelectedGroup(null);
                    }
                }}
            />
        </div>
    );
}
