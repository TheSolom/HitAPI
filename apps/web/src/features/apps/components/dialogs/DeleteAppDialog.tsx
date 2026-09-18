import { useNavigate } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDeleteDialog } from '@/components/common';
import { useDialogState } from '@/hooks';
import { useDeleteAppMutation } from '../../hooks';

interface DeleteAppDialogProps {
    appId: string;
    appName: string;
    trigger?: React.ReactNode;
    redirectToApps?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function DeleteAppDialog({
    appId,
    appName,
    trigger,
    redirectToApps = false,
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
}: Readonly<DeleteAppDialogProps>) {
    const { isOpen, setIsOpen } = useDialogState(
        externalOpen,
        externalOnOpenChange,
    );
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
        <ConfirmDeleteDialog
            open={isOpen}
            onOpenChange={setIsOpen}
            trigger={trigger !== null ? (trigger ?? defaultTrigger) : undefined}
            title={`Delete ${appName}?`}
            confirmLabel="Delete app"
            isPending={deleteApp.isPending}
            onConfirm={handleDelete}
            description="This action cannot be undone. This will permanently delete the app, its endpoints, traffic metrics, and associated request logs."
        />
    );
}
