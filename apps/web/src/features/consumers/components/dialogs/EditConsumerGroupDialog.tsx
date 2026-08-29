import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ConsumerGroupResponseDto } from '@hitapi/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    updateConsumerGroupSchema,
    type UpdateConsumerGroupFormValues,
} from '../../schemas';
import { useUpdateConsumerGroupMutation } from '../../hooks';

interface EditConsumerGroupDialogProps {
    readonly appId: string;
    readonly group: ConsumerGroupResponseDto | null;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

export function EditConsumerGroupDialog({
    appId,
    group,
    open,
    onOpenChange,
}: EditConsumerGroupDialogProps) {
    const updateGroup = useUpdateConsumerGroupMutation();

    const form = useForm<UpdateConsumerGroupFormValues>({
        resolver: zodResolver(updateConsumerGroupSchema),
        defaultValues: {
            name: group?.name ?? '',
        },
    });

    useEffect(() => {
        if (group) {
            form.reset({
                name: group.name,
            });
        }
    }, [group, form]);

    const handleSubmit = (values: UpdateConsumerGroupFormValues) => {
        if (!group) return;
        updateGroup.mutate(
            {
                appId,
                groupId: group.id,
                payload: {
                    name: values.name.trim(),
                },
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Consumer Group</DialogTitle>
                    <DialogDescription>
                        Update the title for this customer group.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        className="space-y-4"
                        noValidate
                        onSubmit={(event) => {
                            void form.handleSubmit(handleSubmit)(event);
                        }}
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Group Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enterprise"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Title for this group.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={updateGroup.isPending}
                            >
                                {updateGroup.isPending
                                    ? 'Saving...'
                                    : 'Save changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
