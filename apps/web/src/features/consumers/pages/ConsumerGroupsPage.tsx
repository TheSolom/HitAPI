import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Layers, Plus, Search, Users } from 'lucide-react';
import type { ConsumerGroupResponseDto } from '@hitapi/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingCards } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { useUiStore } from '@/stores/ui-store';
import { useConsumerGroupsQuery } from '../hooks';
import {
    ConsumerGroupCard,
    CreateConsumerGroupDialog,
    DeleteConsumerGroupDialog,
    EditConsumerGroupDialog,
} from '../components';

export function ConsumerGroupsPage() {
    const activeAppId = useUiStore((s) => s.activeAppId) ?? '';
    const [search, setSearch] = useState('');
    const [selectedGroup, setSelectedGroup] =
        useState<ConsumerGroupResponseDto | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const groupsQuery = useConsumerGroupsQuery(activeAppId || undefined);
    const groups: ConsumerGroupResponseDto[] = groupsQuery.data?.data ?? [];

    const handleEdit = (group: ConsumerGroupResponseDto) => {
        setSelectedGroup(group);
        setEditDialogOpen(true);
    };

    const handleDelete = (group: ConsumerGroupResponseDto) => {
        setSelectedGroup(group);
        setDeleteDialogOpen(true);
    };

    // Filter groups by search query
    const filteredGroups = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return groups;
        return groups.filter((g) => g.name.toLowerCase().includes(query));
    }, [groups, search]);

    const totalConsumersInGroups = useMemo(() => {
        return groups.reduce((acc, g) => acc + (g.consumerCount ?? 0), 0);
    }, [groups]);

    const renderContent = () => {
        if (!activeAppId) {
            return (
                <EmptyState
                    icon={Layers}
                    title="Select an app first"
                    description="Consumer groups are scoped to a single app. Pick an app from the selector in the top bar."
                />
            );
        }

        if (groupsQuery.isLoading) {
            return <LoadingCards count={3} />;
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
                    description="Consumer groups let you segment customer traffic, compare SLAs, and track usage by tier (e.g. VIP, Enterprise, Free). Create your first group to get started."
                    action={
                        <CreateConsumerGroupDialog
                            appId={activeAppId}
                            trigger={
                                <Button size="sm" className="gap-1.5">
                                    <Plus className="h-4 w-4" />
                                    Create First Group
                                </Button>
                            }
                        />
                    }
                />
            );
        }

        return (
            <div className="space-y-6">
                {/* Search and Summary Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 sm:max-w-xs">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search consumer groups..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                            }}
                            className="pl-8.5 h-9 text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                            <strong className="font-semibold text-foreground">
                                {groups.length}
                            </strong>{' '}
                            {groups.length === 1 ? 'group' : 'groups'}
                        </span>
                        <span>•</span>
                        <span>
                            <strong className="font-semibold text-foreground">
                                {totalConsumersInGroups.toLocaleString()}
                            </strong>{' '}
                            total consumers assigned
                        </span>
                    </div>
                </div>

                {filteredGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Layers className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-foreground">
                            No matching groups
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            No consumer group matches &quot;{search}&quot;.
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-3 text-xs"
                            onClick={() => {
                                setSearch('');
                            }}
                        >
                            Clear search
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredGroups.map((group) => (
                            <ConsumerGroupCard
                                key={group.id}
                                appId={activeAppId}
                                group={group}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Consumer Groups"
                description="Bundle consumers into cohorts (e.g. plan tiers, enterprise accounts) to analyze aggregated traffic and performance."
                actions={
                    activeAppId ? (
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link to="/consumers" search={{ appId: activeAppId }}>
                                    <Users className="mr-2 h-4 w-4" />
                                    View Consumers
                                </Link>
                            </Button>
                            <CreateConsumerGroupDialog appId={activeAppId} />
                        </div>
                    ) : null
                }
            />

            {renderContent()}

            <EditConsumerGroupDialog
                appId={activeAppId}
                group={selectedGroup}
                open={editDialogOpen}
                onOpenChange={(open) => {
                    setEditDialogOpen(open);
                    if (!open) {
                        setSelectedGroup(null);
                    }
                }}
            />

            <DeleteConsumerGroupDialog
                appId={activeAppId}
                group={selectedGroup}
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) {
                        setSelectedGroup(null);
                    }
                }}
            />
        </div>
    );
}
