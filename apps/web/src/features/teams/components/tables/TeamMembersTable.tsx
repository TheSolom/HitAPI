import { Trash2, Crown } from 'lucide-react';
import { TeamMemberRoles, type TeamMemberDto } from '@hitapi/types';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { LoadingRows } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { TableWrapper } from '@/components/common';
import {
    useRemoveMemberMutation,
    useTeamMembersQuery,
    useUpdateMemberRoleMutation,
} from '../../hooks';

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export interface TeamMembersTableProps {
    teamId: string;
}

export function TeamMembersTable({ teamId }: Readonly<TeamMembersTableProps>) {
    const membersQuery = useTeamMembersQuery(teamId);
    const updateRole = useUpdateMemberRoleMutation(teamId);
    const removeMember = useRemoveMemberMutation(teamId);

    const members: TeamMemberDto[] = membersQuery.data?.data ?? [];

    if (membersQuery.isLoading) {
        return <LoadingRows />;
    }

    if (membersQuery.isError) {
        return (
            <ErrorState
                error={membersQuery.error}
                onRetry={() => {
                    void membersQuery.refetch();
                }}
            />
        );
    }

    if (members.length === 0) {
        return (
            <EmptyState
                title="No members yet"
                description="Invite a colleague using the form on the right — they'll receive an email invitation."
            />
        );
    }

    return (
        <TableWrapper>
            <Table>
                <caption className="sr-only">
                    Team members and their roles
                </caption>
                <TableHeader>
                    <TableRow>
                        <TableHead scope="col">Member</TableHead>
                        <TableHead scope="col">Role</TableHead>
                        <TableHead scope="col" className="text-right">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => {
                        const isOwner = member.role === TeamMemberRoles.OWNER;
                        const initials =
                            getInitials(member.displayName || member.email) ||
                            'U';

                        return (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary border border-primary/20">
                                            {initials}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5 font-medium text-foreground">
                                                <span className="truncate">
                                                    {member.displayName ||
                                                        'Unnamed member'}
                                                </span>
                                                {isOwner ? (
                                                    <span
                                                        title="Owner"
                                                        className="inline-flex items-center"
                                                    >
                                                        <Crown
                                                            className="h-3.5 w-3.5 text-amber-500 shrink-0"
                                                            aria-label="Owner"
                                                        />
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {member.email}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={member.role}
                                        disabled={
                                            isOwner ||
                                            updateRole.isPending ||
                                            removeMember.isPending
                                        }
                                        onValueChange={(newRole: string) => {
                                            updateRole.mutate({
                                                memberId: member.id,
                                                role: newRole as TeamMemberRoles,
                                            });
                                        }}
                                    >
                                        <SelectTrigger
                                            className="w-32 h-8 text-xs"
                                            aria-label={`Role for ${member.displayName || member.email}`}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value={TeamMemberRoles.MEMBER}
                                            >
                                                Member
                                            </SelectItem>
                                            <SelectItem
                                                value={TeamMemberRoles.ADMIN}
                                            >
                                                Admin
                                            </SelectItem>
                                            {isOwner ? (
                                                <SelectItem
                                                    value={
                                                        TeamMemberRoles.OWNER
                                                    }
                                                >
                                                    Owner
                                                </SelectItem>
                                            ) : null}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        disabled={
                                            isOwner ||
                                            removeMember.isPending ||
                                            updateRole.isPending
                                        }
                                        aria-label={
                                            isOwner
                                                ? 'Cannot remove team owner'
                                                : `Remove ${member.displayName || member.email}`
                                        }
                                        onClick={() => {
                                            removeMember.mutate(member.id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableWrapper>
    );
}
