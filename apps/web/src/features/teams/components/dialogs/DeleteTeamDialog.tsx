import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDeleteTeamMutation, useTeamsQuery } from '../../hooks';

interface DeleteTeamDialogProps {
    readonly teamId: string;
    readonly teamName: string;
    readonly trigger?: React.ReactNode;
    readonly redirectToTeams?: boolean;
    readonly open?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
}

export function DeleteTeamDialog({
    teamId,
    teamName,
    trigger,
    redirectToTeams = false,
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
}: DeleteTeamDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen ?? internalOpen;
    const setIsOpen = externalOnOpenChange ?? setInternalOpen;
    const [confirmationInput, setConfirmationInput] = useState('');
    const deleteTeam = useDeleteTeamMutation();
    const teamsQuery = useTeamsQuery();
    const navigate = useNavigate();

    const teams = teamsQuery.data?.data ?? [];
    const isOnlyTeam = teams.length <= 1;

    const requiredConfirmation = teamName || 'DELETE';
    const isConfirmed =
        confirmationInput.trim().toLowerCase() ===
        requiredConfirmation.toLowerCase();

    const handleOpenChange = (nextOpen: boolean) => {
        if (!deleteTeam.isPending) {
            setIsOpen(nextOpen);
            if (!nextOpen) {
                setConfirmationInput('');
            }
        }
    };

    const handleDelete = () => {
        if (!teamId || isOnlyTeam || !isConfirmed || deleteTeam.isPending) {
            return;
        }

        deleteTeam.mutate(teamId, {
            onSuccess: () => {
                setIsOpen(false);
                if (redirectToTeams) {
                    void navigate({ to: '/teams' });
                }
            },
        });
    };

    const defaultTrigger = (
        <Button variant="destructive" size="sm" disabled={!teamId}>
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Delete team
        </Button>
    );

    let deleteButtonContent: React.ReactNode;
    if (deleteTeam.isPending) {
        deleteButtonContent = (
            <>
                <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                />
                Deleting team...
            </>
        );
    } else {
        deleteButtonContent = (
            <>
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Delete team
            </>
        );
    }

    let dialogBodyContent: React.ReactNode;
    if (isOnlyTeam) {
        dialogBodyContent = (
            <div className="space-y-4 py-2">
                <Alert variant="destructive">
                    <AlertTitle>Cannot delete your only team</AlertTitle>
                    <AlertDescription className="mt-2 text-xs">
                        Every user must have at least one active team to manage
                        apps and credentials. To delete this team, you must
                        first create or join another team, or delete your entire
                        account in Profile &amp; Security.
                    </AlertDescription>
                </Alert>
            </div>
        );
    } else {
        dialogBodyContent = (
            <div className="space-y-4 py-2">
                <Alert variant="destructive">
                    <AlertTitle>Consequences of team deletion</AlertTitle>
                    <AlertDescription className="mt-2">
                        <ul className="list-disc space-y-1 pl-4 text-xs">
                            <li>
                                All applications, endpoints, and metrics
                                belonging to this team will be permanently
                                deactivated.
                            </li>
                            <li>
                                All team members will lose access to this team
                                workspace immediately.
                            </li>
                        </ul>
                    </AlertDescription>
                </Alert>

                <div className="space-y-2">
                    <Label
                        htmlFor="delete-team-confirm"
                        className="text-sm font-medium"
                    >
                        To confirm, type{' '}
                        <span className="font-mono font-semibold text-foreground select-all">
                            {requiredConfirmation}
                        </span>{' '}
                        below:
                    </Label>
                    <Input
                        id="delete-team-confirm"
                        type="text"
                        placeholder={requiredConfirmation}
                        value={confirmationInput}
                        onChange={(e) => {
                            setConfirmationInput(e.target.value);
                        }}
                        disabled={deleteTeam.isPending}
                        autoComplete="off"
                        className="font-mono text-sm"
                    />
                </div>
            </div>
        );
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            {trigger !== null ? (
                <AlertDialogTrigger asChild>
                    {trigger ?? defaultTrigger}
                </AlertDialogTrigger>
            ) : null}
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                        Delete {teamName}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will deactivate and soft-delete this team
                        workspace.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {dialogBodyContent}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteTeam.isPending}>
                        Cancel
                    </AlertDialogCancel>
                    {!isOnlyTeam && (
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={!isConfirmed || deleteTeam.isPending}
                        >
                            {deleteButtonContent}
                        </Button>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
