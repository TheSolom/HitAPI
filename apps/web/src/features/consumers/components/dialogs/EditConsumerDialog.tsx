import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    updateConsumerSchema,
    type UpdateConsumerFormValues,
} from '../../schemas';
import { useUpdateConsumerMutation, useConsumerGroupsQuery } from '../../hooks';

interface EditConsumerDialogProps {
    readonly appId: string;
    readonly consumer: {
        id: number;
        name?: string | null;
        group?: { id: number; name: string } | null;
        identifier?: string;
    };
    readonly trigger?: React.ReactNode;
    readonly open?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
}

export function EditConsumerDialog({
    appId,
    consumer,
    trigger,
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
}: EditConsumerDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen ?? internalOpen;
    const setIsOpen = externalOnOpenChange ?? setInternalOpen;

    const updateConsumer = useUpdateConsumerMutation();
    const groupsQuery = useConsumerGroupsQuery(appId);
    const groups = groupsQuery.data?.data ?? [];

    const form = useForm<UpdateConsumerFormValues>({
        resolver: zodResolver(updateConsumerSchema),
        defaultValues: {
            name: consumer.name ?? '',
            consumerGroupId: consumer.group?.id ?? null,
        },
    });

    const handleSubmit = (values: UpdateConsumerFormValues) => {
        updateConsumer.mutate(
            {
                appId,
                consumerId: consumer.id,
                payload: {
                    name: values.name.trim(),
                    consumerGroupId: values.consumerGroupId ?? null,
                },
            },
            {
                onSuccess: () => {
                    setIsOpen(false);
                },
            },
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Consumer</DialogTitle>
                    <DialogDescription>
                        Update friendly name and customer group assignment for{' '}
                        <span className="font-mono">{consumer.identifier}</span>
                        .
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
                                    <FormLabel>Friendly Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Acme Corp Client"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Display name shown across dashboards.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="consumerGroupId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Consumer Group</FormLabel>
                                    <Select
                                        value={
                                            field.value !== null &&
                                            field.value !== undefined
                                                ? String(field.value)
                                                : 'none'
                                        }
                                        onValueChange={(val) => {
                                            field.onChange(
                                                val === 'none'
                                                    ? null
                                                    : Number(val),
                                            );
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger aria-label="Select consumer group">
                                                <SelectValue placeholder="No group assigned" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                No group
                                            </SelectItem>
                                            {groups.map((group) => (
                                                <SelectItem
                                                    key={group.id}
                                                    value={String(group.id)}
                                                >
                                                    {group.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Assign to a consumer group for aggregate
                                        analytics.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={updateConsumer.isPending}
                            >
                                {updateConsumer.isPending
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
