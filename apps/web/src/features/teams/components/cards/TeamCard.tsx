import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { MoreHorizontal, Copy, Check, Lock } from 'lucide-react';
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
import { DeleteTeamDialog } from '../dialogs/DeleteTeamDialog';

interface TeamCardProps {
    readonly team: TeamResponseDto;
}

export function TeamCard({ team }: TeamCardProps) {
    const [copied, setCopied] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

    return (
        <>
            <div className="group relative flex flex-col justify-between rounded-md border bg-card p-5 transition-colors duration-150 hover:border-border/80">
                <div className="space-y-3">
                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <Link
                                to="/teams/$teamId"
                                params={{ teamId: team.id }}
                                className="truncate block font-semibold text-base text-foreground hover:underline transition-colors tracking-tight"
                            >
                                {team.name}
                            </Link>
                            <span className="font-mono text-xs text-muted-foreground truncate block">
                                {team.slug}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            {team.demo ? (
                                <Badge
                                    variant="outline"
                                    className="text-[11px] font-medium"
                                >
                                    Demo
                                </Badge>
                            ) : null}

                            {team.stealth ? (
                                <Badge
                                    variant="outline"
                                    className="text-[11px] font-medium gap-1"
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
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-md"
                                        aria-label={`Options for ${team.name}`}
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
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

                    {/* Metadata & Members */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
                        <div className="flex items-center gap-2">
                            <span>
                                {memberCount}{' '}
                                {memberCount === 1 ? 'member' : 'members'}
                            </span>
                            {pendingInvitesCount > 0 ? (
                                <>
                                    <span>·</span>
                                    <span>
                                        {String(pendingInvitesCount)} pending{' '}
                                        {pendingInvitesCount === 1
                                            ? 'invite'
                                            : 'invites'}
                                    </span>
                                </>
                            ) : null}
                        </div>

                        {members.length > 0 && (
                            <div className="flex items-center -space-x-1.5 overflow-hidden">
                                {members.slice(0, 3).map((m) => (
                                    <div
                                        key={m.id}
                                        title={`${m.displayName} (${m.role})`}
                                        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-card bg-muted text-[9px] font-medium text-foreground"
                                    >
                                        {m.displayName
                                            ? m.displayName
                                                  .slice(0, 1)
                                                  .toUpperCase()
                                            : 'U'}
                                    </div>
                                ))}
                                {members.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground pl-1.5">
                                        +{members.length - 3}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="mt-4 flex items-center justify-end border-t pt-3">
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-xs font-medium"
                    >
                        <Link to="/teams/$teamId" params={{ teamId: team.id }}>
                            Manage Team
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
