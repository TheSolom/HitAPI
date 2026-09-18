import type { ConsumerGroupResponseDto } from '@hitapi/types';
import { ConfirmDeleteDialog } from '@/components/common';
import { useDeleteConsumerGroupMutation } from '../../hooks';

interface DeleteConsumerGroupDialogProps {
    appId: string;
    group: ConsumerGroupResponseDto | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteConsumerGroupDialog({
    appId,
    group,
    open,
    onOpenChange,
}: Readonly<DeleteConsumerGroupDialogProps>) {
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
        <ConfirmDeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete Consumer Group"
            confirmLabel="Delete Group"
            isPending={deleteGroupMutation.isPending}
            onConfirm={handleDelete}
            description={
                <>
                    Are you sure you want to delete the consumer group{' '}
                    <strong className="text-foreground">
                        &quot;{group.name}&quot;
                    </strong>
                    ?
                    <br />
                    <br />
                    Consumers previously assigned to this group will remain
                    registered in your app, but will become unassigned.
                </>
            }
        />
    );
}
