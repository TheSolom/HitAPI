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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createTeamSchema, type CreateTeamFormValues } from '../../schemas';
import { useCreateTeamMutation } from '../../hooks';
import { applyFormErrors } from '@/lib/api';

interface CreateTeamDialogProps {
    readonly trigger?: React.ReactNode;
}

export function CreateTeamDialog({ trigger }: CreateTeamDialogProps) {
    const [open, setOpen] = useState(false);
    const createTeam = useCreateTeamMutation();

    const form = useForm<CreateTeamFormValues>({
        resolver: zodResolver(createTeamSchema),
        defaultValues: { name: '', demo: false, stealth: false },
    });

    const handleSubmit = (values: CreateTeamFormValues) => {
        createTeam.mutate(values, {
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
            onError: (error) => {
                applyFormErrors(form.setError, error);
            },
        });
    };

    const defaultTrigger = (
        <Button>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New team
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a team</DialogTitle>
                    <DialogDescription>
                        Teams own apps, consumers and monitoring configurations.
                        You'll be the owner.
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
                                    <FormLabel>Team name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Platform Engineering"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={createTeam.isPending}
                            >
                                {createTeam.isPending
                                    ? 'Creating...'
                                    : 'Create team'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
