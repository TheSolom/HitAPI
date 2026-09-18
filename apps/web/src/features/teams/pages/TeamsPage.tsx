import { useMemo, useState } from 'react';
import { Users2, Search } from 'lucide-react';
import type { TeamResponseDto } from '@hitapi/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchInput } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingCards } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { useTeamsQuery } from '../hooks';
import { TeamCard, CreateTeamDialog } from '../components';

type TeamFilter = 'all' | 'standard' | 'demo' | 'stealth';

export function TeamsPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<TeamFilter>('all');

    const teamsQuery = useTeamsQuery();
    const teams = useMemo(
        (): TeamResponseDto[] => teamsQuery.data?.data ?? [],
        [teamsQuery.data?.data],
    );

    const demoCount = useMemo(
        () => teams.filter((t) => t.demo).length,
        [teams],
    );
    const stealthCount = useMemo(
        () => teams.filter((t) => t.stealth).length,
        [teams],
    );

    const filteredTeams = useMemo(() => {
        const query = search.trim().toLowerCase();
        return teams.filter((team) => {
            const matchesSearch =
                !query ||
                team.name.toLowerCase().includes(query) ||
                team.slug.toLowerCase().includes(query) ||
                (team.teamMembers !== undefined &&
                    team.teamMembers.some(
                        (m) =>
                            m.displayName.toLowerCase().includes(query) ||
                            m.email.toLowerCase().includes(query),
                    ));

            let matchesFilter = true;
            if (filter === 'demo') {
                matchesFilter = team.demo;
            } else if (filter === 'stealth') {
                matchesFilter = team.stealth;
            } else if (filter === 'standard') {
                matchesFilter = !team.demo && !team.stealth;
            }

            return matchesSearch && matchesFilter;
        });
    }, [teams, search, filter]);

    const renderContent = () => {
        if (teamsQuery.isLoading) {
            return <LoadingCards />;
        }

        if (teamsQuery.isError) {
            return (
                <ErrorState
                    error={teamsQuery.error}
                    onRetry={() => {
                        void teamsQuery.refetch();
                    }}
                />
            );
        }

        if (teams.length === 0) {
            return (
                <EmptyState
                    icon={Users2}
                    title="No teams yet"
                    description="Create a team to group your apps, invite colleagues and share dashboards. Every app belongs to exactly one team."
                    action={<CreateTeamDialog />}
                />
            );
        }

        if (filteredTeams.length === 0) {
            return (
                <EmptyState
                    icon={Search}
                    title="No matching teams found"
                    description="No teams match your search query or selected filter."
                    isFiltered
                    onResetFilters={() => {
                        setSearch('');
                        setFilter('all');
                    }}
                    resetLabel="Clear filters"
                />
            );
        }

        return (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredTeams.map((team) => (
                    <TeamCard key={team.id} team={team} />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Teams"
                description="Manage your team workspaces, invite members, and configure access."
                actions={<CreateTeamDialog />}
            />

            {teams.length > 0 ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search teams by name, slug or member..."
                        className="max-w-sm flex-1"
                    />

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        <Button
                            variant={filter === 'all' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 gap-1.5 text-xs font-medium"
                            onClick={() => {
                                setFilter('all');
                            }}
                        >
                            <span>All</span>
                            <Badge
                                variant="outline"
                                className="h-4.5 px-1 text-[10px]"
                            >
                                {teams.length}
                            </Badge>
                        </Button>

                        {demoCount > 0 ? (
                            <Button
                                variant={
                                    filter === 'demo' ? 'secondary' : 'ghost'
                                }
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-medium"
                                onClick={() => {
                                    setFilter('demo');
                                }}
                            >
                                <span>Demo</span>
                                <Badge
                                    variant="outline"
                                    className="h-4.5 px-1 text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                >
                                    {demoCount}
                                </Badge>
                            </Button>
                        ) : null}

                        {stealthCount > 0 ? (
                            <Button
                                variant={
                                    filter === 'stealth' ? 'secondary' : 'ghost'
                                }
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-medium"
                                onClick={() => {
                                    setFilter('stealth');
                                }}
                            >
                                <span>Stealth</span>
                                <Badge
                                    variant="outline"
                                    className="h-4.5 px-1 text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                                >
                                    {stealthCount}
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
