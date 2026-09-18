import { useEffect, useMemo, useState } from 'react';
import { Boxes, Users2, Search } from 'lucide-react';
import type { AppResponseDto } from '@hitapi/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchInput } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingCards } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { useUiStore } from '@/stores/ui-store';
import { useTeamsQuery, CreateTeamDialog } from '@/features/teams';
import { useAppsQuery } from '../hooks';
import { AppCard, CreateAppDialog } from '../components';

type StatusFilter = 'all' | 'active' | 'inactive';

export function AppsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const activeTeamId = useUiStore((s) => s.activeTeamId);
    const setActiveTeamId = useUiStore((s) => s.setActiveTeamId);
    const teamsQuery = useTeamsQuery();
    const teams = useMemo(
        () => teamsQuery.data?.data ?? [],
        [teamsQuery.data?.data],
    );

    const effectiveTeamId = activeTeamId ?? teams[0]?.id;

    useEffect(() => {
        if (!activeTeamId && teams.length > 0) {
            const firstTeamId = teams[0]?.id;
            if (firstTeamId) {
                setActiveTeamId(firstTeamId);
            }
        }
    }, [activeTeamId, teams, setActiveTeamId]);

    const appsQuery = useAppsQuery(
        effectiveTeamId ? { teamId: effectiveTeamId } : undefined,
    );

    const apps = useMemo(
        (): AppResponseDto[] => appsQuery.data?.data ?? [],
        [appsQuery.data?.data],
    );

    const activeCount = useMemo(
        () => apps.filter((a) => a.active).length,
        [apps],
    );
    const inactiveCount = apps.length - activeCount;

    const filteredApps = useMemo(() => {
        const query = search.trim().toLowerCase();
        return apps.filter((app) => {
            const matchesSearch =
                !query ||
                app.name.toLowerCase().includes(query) ||
                app.slug.toLowerCase().includes(query) ||
                app.framework.name.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' ? app.active : !app.active);

            return matchesSearch && matchesStatus;
        });
    }, [apps, search, statusFilter]);

    const renderContent = () => {
        if (appsQuery.isLoading || teamsQuery.isLoading) {
            return <LoadingCards />;
        }

        if (appsQuery.isError) {
            return (
                <ErrorState
                    error={appsQuery.error}
                    onRetry={() => {
                        void appsQuery.refetch();
                    }}
                />
            );
        }

        if (teams.length === 0) {
            return (
                <EmptyState
                    icon={Users2}
                    title="Create a team first"
                    description="Apps are owned and managed by teams. Create a team to group your apps, invite colleagues, and share dashboards."
                    action={<CreateTeamDialog />}
                />
            );
        }

        if (apps.length === 0) {
            return (
                <EmptyState
                    icon={Boxes}
                    title="No apps yet"
                    description="Create an app, then install the HitAPI SDK in your service and point it at the generated client key. Data appears within a minute of the first request."
                    action={<CreateAppDialog teamId={effectiveTeamId} />}
                />
            );
        }

        if (filteredApps.length === 0) {
            return (
                <EmptyState
                    icon={Search}
                    title="No matching apps found"
                    description="No apps match your search keyword or active status filter."
                    isFiltered
                    onResetFilters={() => {
                        setSearch('');
                        setStatusFilter('all');
                    }}
                    resetLabel="Clear filters"
                />
            );
        }

        return (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredApps.map((app) => (
                    <AppCard key={app.id} app={app} />
                ))}
            </div>
        );
    };

    const headerAction =
        teams.length === 0 ? (
            <CreateTeamDialog />
        ) : (
            <CreateAppDialog teamId={effectiveTeamId} />
        );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Apps"
                description="Every monitored API service, its configuration, and SDK status."
                actions={headerAction}
            />

            {apps.length > 0 ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search apps by name, slug or framework..."
                        className="max-w-sm flex-1"
                    />

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        <Button
                            variant={
                                statusFilter === 'all' ? 'secondary' : 'ghost'
                            }
                            size="sm"
                            className="h-8 gap-1.5 text-xs font-medium"
                            onClick={() => {
                                setStatusFilter('all');
                            }}
                        >
                            <span>All</span>
                            <Badge
                                variant="outline"
                                className="h-4.5 px-1 text-[10px]"
                            >
                                {apps.length}
                            </Badge>
                        </Button>
                        <Button
                            variant={
                                statusFilter === 'active'
                                    ? 'secondary'
                                    : 'ghost'
                            }
                            size="sm"
                            className="h-8 gap-1.5 text-xs font-medium"
                            onClick={() => {
                                setStatusFilter('active');
                            }}
                        >
                            <span>Active</span>
                            <Badge
                                variant="outline"
                                className="h-4.5 px-1 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            >
                                {activeCount}
                            </Badge>
                        </Button>
                        {inactiveCount > 0 ? (
                            <Button
                                variant={
                                    statusFilter === 'inactive'
                                        ? 'secondary'
                                        : 'ghost'
                                }
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-medium"
                                onClick={() => {
                                    setStatusFilter('inactive');
                                }}
                            >
                                <span>Inactive</span>
                                <Badge
                                    variant="outline"
                                    className="h-4.5 px-1 text-[10px]"
                                >
                                    {inactiveCount}
                                </Badge>
                            </Button>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {renderContent()}
        </div>
    );
}
