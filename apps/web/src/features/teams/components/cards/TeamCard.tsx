import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
    Users2,
    Users,
    Boxes,
    ArrowRight,
    MoreHorizontal,
    Copy,
    Check,
    Lock,
    Sparkles,
    Calendar,
    Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import type { TeamResponseDto } from '@hitapi/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUiStore } from '@/stores/ui-store';
import { DeleteTeamDialog } from '../dialogs/DeleteTeamDialog';

interface TeamCardProps {
    readonly team: TeamResponseDto;
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

export function TeamCard({ team }: TeamCardProps) {
    const [copied, setCopied] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const setActiveTeamId = useUiStore((s) => s.setActiveTeamId);

    const members = team.teamMembers ?? [];
    const memberCount = members.length;
    const pendingInvitesCount = team.invites?.length ?? 0;

    const handleCopyTeamId = (e: React.MouseEvent) => {
        e.stopPropagation();
        void navigator.clipboard.writeText(team.id);
        setCopied(true);
        toast.success('Team ID copied to clipboard');
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const handleSelectTeamForApps = () => {
        setActiveTeamId(team.id);
    };

    return (
        <>
            <div className="group relative flex flex-col justify-between rounded-xl border bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md">
                <div className="space-y-4">
                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/60 text-primary group-hover:border-primary/30 group-hover:bg-primary/5 font-bold text-sm transition-colors">
                                {getInitials(team.name) || (
                                    <Users2 className="h-5 w-5" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <Link
                                    to="/teams/$teamId"
                                    params={{ teamId: team.id }}
                                    className="truncate block font-semibold text-foreground group-hover:text-primary transition-colors"
                                >
                                    {team.name}
                                </Link>
                                <span className="font-mono text-xs text-muted-foreground truncate block">
                                    {team.slug}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            {team.demo ? (
                                <Badge
                                    variant="outline"
                                    className="gap-1 text-[11px] font-medium border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                                >
                                    <Sparkles className="h-3 w-3" />
                                    Demo
                                </Badge>
                            ) : null}

                            {team.stealth ? (
                                <Badge
                                    variant="outline"
                                    className="gap-1 text-[11px] font-medium border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10"
                                >
                                    <Lock className="h-3 w-3" />
                                    Stealth
                                </Badge>
                            ) : null}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        aria-label={`Options for ${team.name}`}
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link
                                            to="/teams/$teamId"
                                            params={{ teamId: team.id }}
                                        >
                                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                            Manage Members
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        asChild
                                        onClick={handleSelectTeamForApps}
                                    >
                                        <Link to="/apps">
                                            <Boxes className="mr-2 h-4 w-4 text-muted-foreground" />
                                            View Team Apps
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            handleCopyTeamId(e);
                                        }}
                                    >
                                        {copied ? (
                                            <Check className="mr-2 h-4 w-4 text-emerald-500" />
                                        ) : (
                                            <Copy className="mr-2 h-4 w-4 text-muted-foreground" />
                                        )}
                                        Copy Team ID
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setDeleteDialogOpen(true);
                                        }}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        Delete Team
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Metadata & Key Info Chips */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2.5 py-1.5 text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-muted-foreground">
                                Status:
                            </span>
                            <span className="font-medium text-foreground">
                                Active
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2.5 py-1.5 text-xs">
                            {pendingInvitesCount > 0 ? (
                                <>
                                    <Mail className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                    <span className="text-muted-foreground">
                                        Invites:
                                    </span>
                                    <span className="font-medium text-amber-600 dark:text-amber-400">
                                        {pendingInvitesCount} pending
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">
                                        Invites:
                                    </span>
                                    <span className="font-medium text-muted-foreground">
                                        None
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Members List Box */}
                    <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Members</span>
                            <span className="font-semibold text-foreground">
                                ({memberCount})
                            </span>
                        </div>
                        <div className="flex items-center -space-x-1.5 overflow-hidden">
                            {members.length > 0 ? (
                                members.slice(0, 4).map((m) => (
                                    <div
                                        key={m.id}
                                        title={`${m.displayName} (${m.role})`}
                                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary text-[10px] font-bold text-primary-foreground shadow-xs"
                                    >
                                        {m.displayName
                                            ? m.displayName
                                                  .slice(0, 1)
                                                  .toUpperCase()
                                            : 'U'}
                                    </div>
                                ))
                            ) : (
                                <span className="text-xs text-muted-foreground italic">
                                    0 members
                                </span>
                            )}
                            {members.length > 4 ? (
                                <div className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-muted-foreground">
                                    +{members.length - 4}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="mt-5 flex items-center justify-between border-t pt-3.5">
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs font-medium"
                        onClick={handleSelectTeamForApps}
                    >
                        <Link to="/apps">
                            <Boxes className="h-3.5 w-3.5" />
                            <span>View Apps</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        size="sm"
                        className="h-8 gap-1 text-xs font-medium"
                    >
                        <Link to="/teams/$teamId" params={{ teamId: team.id }}>
                            <span>Manage Team</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </div>
            </div>

            <DeleteTeamDialog
                teamId={team.id}
                teamName={team.name}
                trigger={null}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            />
        </>
    );
}
