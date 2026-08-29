import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import type { UserProfile } from '@hitapi/types';
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
import { useDeleteAccountMutation } from '../../hooks';

interface DeleteAccountDialogProps {
    readonly user: UserProfile | null;
    readonly trigger?: React.ReactNode;
}

export function DeleteAccountDialog({
    user,
    trigger,
}: DeleteAccountDialogProps) {
    const [open, setOpen] = useState(false);
    const [confirmationInput, setConfirmationInput] = useState('');
    const deleteAccount = useDeleteAccountMutation();
    const navigate = useNavigate();

    const requiredConfirmation = user?.email ?? 'DELETE';
    const isConfirmed =
        confirmationInput.trim().toLowerCase() ===
        requiredConfirmation.toLowerCase();

    const handleOpenChange = (nextOpen: boolean) => {
        if (!deleteAccount.isPending) {
            setOpen(nextOpen);
            if (!nextOpen) {
                setConfirmationInput('');
            }
        }
    };

    const handleDelete = () => {
        if (!isConfirmed || deleteAccount.isPending) {
            return;
        }

        deleteAccount.mutate(undefined, {
            onSuccess: () => {
                setOpen(false);
                void navigate({ to: '/login' });
            },
        });
    };

    const defaultTrigger = (
        <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Delete Account
        </Button>
    );

    let deleteButtonContent: React.ReactNode;
    if (deleteAccount.isPending) {
        deleteButtonContent = (
            <>
                <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                />
                Deleting account...
            </>
        );
    } else {
        deleteButtonContent = (
            <>
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Delete Account
            </>
        );
    }

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                {trigger ?? defaultTrigger}
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                        Delete Account
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This will deactivate your personal account.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-2">
                    <Alert variant="destructive">
                        <AlertTitle>
                            Consequences of account deletion
                        </AlertTitle>
                        <AlertDescription className="mt-2">
                            <ul className="list-disc space-y-1 pl-4 text-xs">
                                <li>
                                    Your access to team workspaces and shared
                                    resources will be revoked.
                                </li>
                                <li>
                                    You will be logged out of all connected
                                    devices immediately.
                                </li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label
                            htmlFor="delete-account-confirm"
                            className="text-sm font-medium"
                        >
                            To confirm, type{' '}
                            <span className="font-mono font-semibold text-foreground select-all">
                                {requiredConfirmation}
                            </span>{' '}
                            below:
                        </Label>
                        <Input
                            id="delete-account-confirm"
                            type="text"
                            placeholder={requiredConfirmation}
                            value={confirmationInput}
                            onChange={(e) => {
                                setConfirmationInput(e.target.value);
                            }}
                            disabled={deleteAccount.isPending}
                            autoComplete="off"
                            className="font-mono text-sm"
                        />
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteAccount.isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={!isConfirmed || deleteAccount.isPending}
                    >
                        {deleteButtonContent}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
