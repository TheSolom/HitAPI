import { Mail, Trash2 } from 'lucide-react';
import type { TeamInviteDto } from '@hitapi/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingRows } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { useRevokeInviteMutation, useTeamInvitesQuery } from '../../hooks';

interface PendingInvitesCardProps {
    readonly teamId: string;
}

export function PendingInvitesCard({ teamId }: PendingInvitesCardProps) {
    const invitesQuery = useTeamInvitesQuery(teamId);
    const revokeInvite = useRevokeInviteMutation(teamId);
    const invites: TeamInviteDto[] = invitesQuery.data?.data ?? [];

    const renderContent = () => {
        if (invitesQuery.isLoading) {
            return <LoadingRows rows={2} />;
        }

        if (invitesQuery.isError) {
            return (
                <ErrorState
                    error={invitesQuery.error}
                    onRetry={() => {
                        void invitesQuery.refetch();
                    }}
                />
            );
        }

        if (invites.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Mail className="h-6 w-6 text-muted-foreground/40" />
                    <p className="mt-2 text-xs text-muted-foreground">
                        No pending invitations.
                    </p>
                </div>
            );
        }

        return (
            <ul className="space-y-2">
                {invites.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center justify-between gap-2 rounded-lg border bg-muted/20 p-2.5 transition-colors"
                    >
                        <div className="flex min-w-0 items-center gap-2 text-xs">
                            <Mail
                                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <span className="truncate font-medium text-foreground">
                                {item.email}
                            </span>
                            <Badge
                                variant="outline"
                                className="capitalize text-[10px] h-4.5 px-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            >
                                {item.status}
                            </Badge>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                            aria-label={`Revoke invite for ${item.email}`}
                            title={`Revoke invite for ${item.email}`}
                            disabled={revokeInvite.isPending}
                            onClick={() => {
                                revokeInvite.mutate(item.id);
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                    <span>Pending Invites</span>
                    <Badge variant="outline" className="font-normal text-xs">
                        {invites.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>{renderContent()}</CardContent>
        </Card>
    );
}
