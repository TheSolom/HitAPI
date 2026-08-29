import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ConsumerGroupResponseDto } from '@hitapi/types';
import { useDeleteConsumerGroupMutation } from '../../hooks';

interface DeleteConsumerGroupDialogProps {
    readonly appId: string;
    readonly group: ConsumerGroupResponseDto | null;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

export function DeleteConsumerGroupDialog({
    appId,
    group,
    open,
    onOpenChange,
}: DeleteConsumerGroupDialogProps) {
    const deleteGroupMutation = useDeleteConsumerGroupMutation();

    if (!group) return null;

    const handleDelete = () => {
        deleteGroupMutation.mutate(
            {
                appId,
                groupId: group.id,
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                },
            },
        );
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Consumer Group</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the consumer group{' '}
                        <strong className="text-foreground">
                            &quot;{group.name}&quot;
                        </strong>
                        ?
                        <br />
                        <br />
                        Consumers previously assigned to this group will remain
                        registered in your app, but will become unassigned.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteGroupMutation.isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={deleteGroupMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {deleteGroupMutation.isPending
                            ? 'Deleting...'
                            : 'Delete Group'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
