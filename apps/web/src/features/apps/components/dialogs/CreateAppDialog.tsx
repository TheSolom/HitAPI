import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Users2 } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useUiStore } from '@/stores/ui-store';
import {
    useTeamsQuery,
    CreateTeamDialog as NewTeamDialog,
} from '@/features/teams';
import { TargetResponseTimeSlider } from '@/components/common/target-response-time-slider';
import { createAppSchema, type CreateAppFormValues } from '../../schemas';
import { useCreateAppMutation, useFrameworksQuery } from '../../hooks';
import { applyFormErrors } from '@/lib/api';

interface CreateAppDialogProps {
    readonly trigger?: React.ReactNode;
    readonly teamId?: string;
}

export function CreateAppDialog({ trigger, teamId }: CreateAppDialogProps) {
    const [open, setOpen] = useState(false);
    const createApp = useCreateAppMutation();
    const activeTeamId = useUiStore((s) => s.activeTeamId);
    const teamsQuery = useTeamsQuery();
    const teams = useMemo(
        () => teamsQuery.data?.data ?? [],
        [teamsQuery.data?.data],
    );
    const frameworksQuery = useFrameworksQuery();
    const frameworks = useMemo(
        () => frameworksQuery.data?.data ?? [],
        [frameworksQuery.data?.data],
    );

    const fallbackTeamId = teams.length > 0 ? (teams[0]?.id ?? '') : '';
    const effectiveTeamId = teamId ?? activeTeamId ?? fallbackTeamId;

    const initialFrameworkId =
        frameworks.length > 0 ? (frameworks[0]?.id ?? 1) : 1;

    const form = useForm<CreateAppFormValues>({
        resolver: zodResolver(createAppSchema),
        defaultValues: {
            name: '',
            frameworkId: initialFrameworkId,
            teamId: effectiveTeamId,
            targetResponseTimeMs: 500,
        },
    });

    useEffect(() => {
        if (effectiveTeamId && !form.getValues('teamId')) {
            form.setValue('teamId', effectiveTeamId);
        }
    }, [effectiveTeamId, form]);

    useEffect(() => {
        if (frameworks.length > 0 && !form.getValues('frameworkId')) {
            form.setValue('frameworkId', frameworks[0].id);
        }
    }, [frameworks, form]);

    const handleSubmit = (values: CreateAppFormValues) => {
        createApp.mutate(values, {
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
            New app
        </Button>
    );

    if (teams.length === 0) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {trigger ?? defaultTrigger}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a team first</DialogTitle>
                        <DialogDescription>
                            Every app belongs to a team. Please create a team
                            first to group your apps and invite teammates.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <NewTeamDialog
                            trigger={
                                <Button
                                    onClick={() => {
                                        setOpen(false);
                                    }}
                                >
                                    <Users2 className="mr-2 h-4 w-4" />
                                    Create a team
                                </Button>
                            }
                        />
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create an app</DialogTitle>
                    <DialogDescription>
                        An app represents one monitored API service.
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
                                    <FormLabel>App name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Checkout API"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        You'll get a client key to configure in
                                        the HitAPI SDK.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="frameworkId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Framework</FormLabel>
                                    <Select
                                        value={
                                            field.value
                                                ? String(field.value)
                                                : undefined
                                        }
                                        onValueChange={(val) => {
                                            field.onChange(Number(val));
                                        }}
                                        disabled={frameworksQuery.isLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger aria-label="Select framework">
                                                <SelectValue
                                                    placeholder={
                                                        frameworksQuery.isLoading
                                                            ? 'Loading frameworks...'
                                                            : 'Select a framework'
                                                    }
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {frameworks.map((fw) => (
                                                <SelectItem
                                                    key={fw.id}
                                                    value={String(fw.id)}
                                                >
                                                    {fw.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {teams.length > 1 && !teamId && (
                            <FormField
                                control={form.control}
                                name="teamId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Team</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger aria-label="Select team">
                                                    <SelectValue placeholder="Select a team" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {teams.map((t) => (
                                                    <SelectItem
                                                        key={t.id}
                                                        value={t.id}
                                                    >
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="targetResponseTimeMs"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Response Time</FormLabel>
                                    <FormControl>
                                        <TargetResponseTimeSlider
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={createApp.isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={createApp.isPending}
                            >
                                {createApp.isPending
                                    ? 'Creating...'
                                    : 'Create app'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
