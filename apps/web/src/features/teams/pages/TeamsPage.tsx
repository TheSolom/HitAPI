import { useMemo, useState } from 'react';
import { Users2, Search, X } from 'lucide-react';
import type { TeamResponseDto } from '@hitapi/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
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

    const demoCount = useMemo(() => teams.filter((t) => t.demo).length, [teams]);
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
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                    <h3 className="mt-3 text-base font-semibold">
                        No matching teams found
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        No teams match your search query or selected filter.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => {
                            setSearch('');
                            setFilter('all');
                        }}
                    >
                        Clear filters
                    </Button>
                </div>
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
                description="Switch between teams, manage members and control who can see your API data."
                actions={<CreateTeamDialog />}
            />

            {teams.length > 0 ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                            }}
                            placeholder="Search teams by name, slug or member..."
                            className="pl-9 pr-9"
                            aria-label="Search teams"
                        />
                        {search ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label="Clear search"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        ) : null}
                    </div>

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

