import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useDeleteAppMutation } from '../../hooks';

interface DeleteAppDialogProps {
    readonly appId: string;
    readonly appName: string;
    readonly trigger?: React.ReactNode;
    readonly redirectToApps?: boolean;
    readonly open?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
}

export function DeleteAppDialog({
    appId,
    appName,
    trigger,
    redirectToApps = false,
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
}: DeleteAppDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen ?? internalOpen;
    const setIsOpen = externalOnOpenChange ?? setInternalOpen;
    const deleteApp = useDeleteAppMutation();
    const navigate = useNavigate();

    const handleDelete = () => {
        deleteApp.mutate(appId, {
            onSuccess: () => {
                setIsOpen(false);
                if (redirectToApps) {
                    void navigate({ to: '/apps' });
                }
            },
        });
    };

    const defaultTrigger = (
        <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Delete
        </Button>
    );

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger !== null ? (
                <AlertDialogTrigger asChild>
                    {trigger ?? defaultTrigger}
                </AlertDialogTrigger>
            ) : null}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete {appName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the app, its endpoints, traffic metrics, and
                        associated request logs.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteApp.isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deleteApp.isPending}
                    >
                        {deleteApp.isPending ? 'Deleting...' : 'Delete app'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
