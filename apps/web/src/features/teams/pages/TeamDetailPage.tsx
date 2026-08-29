import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
    ChevronLeft,
    Boxes,
    Users2,
    Copy,
    Check,
    Lock,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { LoadingRows } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { useUiStore } from '@/stores/ui-store';
import { useTeamQuery } from '../hooks';
import {
    DeleteTeamDialog,
    InviteMemberForm,
    PendingInvitesCard,
    TeamMembersTable,
} from '../components';

interface TeamDetailPageProps {
    readonly teamId: string;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function TeamDetailPage({ teamId }: TeamDetailPageProps) {
    const [copied, setCopied] = useState(false);
    const setActiveTeamId = useUiStore((s) => s.setActiveTeamId);
    const teamQuery = useTeamQuery(teamId);
    const team = teamQuery.data?.data;

    if (teamQuery.isLoading) {
        return (
            <div className="space-y-6">
                <LoadingRows rows={3} />
            </div>
        );
    }

    if (teamQuery.isError || !team) {
        return (
            <ErrorState
                error={teamQuery.error ?? new Error('Team not found')}
                onRetry={() => {
                    void teamQuery.refetch();
                }}
            />
        );
    }

    const handleCopySlug = () => {
        void navigator.clipboard.writeText(team.slug);
        setCopied(true);
        toast.success('Team slug copied to clipboard');
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const handleSelectTeamForApps = () => {
        setActiveTeamId(team.id);
    };

    const memberCount = team.teamMembers?.length ?? 0;

    const headerActions = (
        <div className="flex flex-wrap items-center gap-2">
            <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleSelectTeamForApps}
            >
                <Link to="/apps">
                    <Boxes className="h-4 w-4 text-muted-foreground" />
                    <span>View Apps</span>
                </Link>
            </Button>
            <DeleteTeamDialog
                teamId={team.id}
                teamName={team.name}
                redirectToTeams
                trigger={
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete team</span>
                    </Button>
                }
            />
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <Link
                    to="/teams"
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-3"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Back to Teams</span>
                </Link>

                <PageHeader
                    title={
                        <div className="flex items-center gap-3.5 flex-wrap">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-muted/60 text-primary font-bold text-base shadow-xs">
                                {getInitials(team.name) || (
                                    <Users2 className="h-5 w-5" />
                                )}
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                        {team.name}
                                    </h1>
                                    <Badge
                                        variant="default"
                                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1.5 font-medium text-xs"
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Active
                                    </Badge>
                                    {team.demo ? (
                                        <Badge
                                            variant="outline"
                                            className="gap-1 text-xs font-medium border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                                        >
                                            <Sparkles className="h-3 w-3" />
                                            Demo
                                        </Badge>
                                    ) : null}
                                    {team.stealth ? (
                                        <Badge
                                            variant="outline"
                                            className="gap-1 text-xs font-medium border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10"
                                        >
                                            <Lock className="h-3 w-3" />
                                            Stealth
                                        </Badge>
                                    ) : null}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCopySlug}
                                    className="group inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    title="Click to copy slug"
                                >
                                    <span>{team.slug}</span>
                                    {copied ? (
                                        <Check className="h-3 w-3 text-emerald-500" />
                                    ) : (
                                        <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                                    )}
                                </button>
                            </div>
                        </div>
                    }
                    description="Manage team workspace access, member roles, and active invitations."
                    actions={headerActions}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <span>Team Members</span>
                                    <Badge
                                        variant="outline"
                                        className="font-normal text-xs"
                                    >
                                        {memberCount}
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Owners manage settings and billing, admins
                                    manage apps, members have viewing access.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <TeamMembersTable teamId={teamId} />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <InviteMemberForm teamId={teamId} />
                    <PendingInvitesCard teamId={teamId} />
                </div>
            </div>
        </div>
    );
}

