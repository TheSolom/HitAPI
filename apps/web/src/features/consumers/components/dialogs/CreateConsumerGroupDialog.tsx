import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
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
    createConsumerGroupSchema,
    type CreateConsumerGroupFormValues,
} from '../../schemas';
import { useCreateConsumerGroupMutation } from '../../hooks';

interface CreateConsumerGroupDialogProps {
    readonly appId: string;
    readonly trigger?: React.ReactNode;
}

export function CreateConsumerGroupDialog({
    appId,
    trigger,
}: CreateConsumerGroupDialogProps) {
    const [open, setOpen] = useState(false);
    const createGroup = useCreateConsumerGroupMutation();

    const form = useForm<CreateConsumerGroupFormValues>({
        resolver: zodResolver(createConsumerGroupSchema),
        defaultValues: {
            name: '',
        },
    });

    const handleSubmit = (values: CreateConsumerGroupFormValues) => {
        createGroup.mutate(
            {
                appId,
                payload: {
                    name: values.name.trim(),
                },
            },
            {
                onSuccess: () => {
                    form.reset();
                    setOpen(false);
                },
            },
        );
    };

    const defaultTrigger = (
        <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Consumer Group
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Consumer Group</DialogTitle>
                    <DialogDescription>
                        Create a group to segment customer traffic, SLAs, and
                        analytics.
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
                                            placeholder="e.g. Enterprise Tier"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        A descriptive title for this consumer
                                        segment.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={createGroup.isPending}
                            >
                                {createGroup.isPending
                                    ? 'Creating...'
                                    : 'Create group'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
