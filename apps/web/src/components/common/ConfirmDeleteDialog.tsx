import type { ReactNode } from 'react';
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

export interface ConfirmDeleteDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: ReactNode;
    title: string;
    description: ReactNode;
    confirmLabel?: string;
    isPending?: boolean;
    onConfirm: () => void;
}

export function ConfirmDeleteDialog({
    open,
    onOpenChange,
    trigger,
    title,
    description,
    confirmLabel = 'Delete',
    isPending = false,
    onConfirm,
}: Readonly<ConfirmDeleteDialogProps>) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {trigger ? (
                <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            ) : null}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div>{description}</div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending ? 'Deleting...' : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
