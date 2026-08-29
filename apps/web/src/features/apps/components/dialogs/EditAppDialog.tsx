import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings } from 'lucide-react';
import type { AppResponseDto } from '@hitapi/types';
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
import { Switch } from '@/components/ui/switch';
import { TargetResponseTimeSlider } from '@/components/ui/target-response-time-slider';
import { updateAppSchema, type UpdateAppFormValues } from '../../schemas';
import { useUpdateAppMutation, useFrameworksQuery } from '../../hooks';
import { applyFormErrors } from '@/lib/api';

interface EditAppDialogProps {
    readonly app: AppResponseDto;
    readonly trigger?: React.ReactNode;
    readonly open?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
}

export function EditAppDialog({
    app,
    trigger,
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
}: EditAppDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen ?? internalOpen;
    const setIsOpen = externalOnOpenChange ?? setInternalOpen;
    const updateApp = useUpdateAppMutation(app.id);
    const frameworksQuery = useFrameworksQuery();
    const frameworks = frameworksQuery.data?.data ?? [];

    const form = useForm<UpdateAppFormValues>({
        resolver: zodResolver(updateAppSchema),
        defaultValues: {
            name: app.name,
            frameworkId: app.framework.id,
            targetResponseTimeMs: app.targetResponseTimeMs,
            active: app.active,
        },
    });

    const handleSubmit = (values: UpdateAppFormValues) => {
        updateApp.mutate(values, {
            onSuccess: () => {
                setIsOpen(false);
            },
            onError: (error) => {
                applyFormErrors(form.setError, error);
            },
        });
    };

    const defaultTrigger = (
        <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
            Settings
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger !== null ? (
                <DialogTrigger asChild>
                    {trigger ?? defaultTrigger}
                </DialogTrigger>
            ) : null}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>App Settings</DialogTitle>
                    <DialogDescription>
                        Configure general settings and Apdex target thresholds
                        for {app.name}.
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
                                            placeholder="App name"
                                            {...field}
                                        />
                                    </FormControl>
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

                        <FormField
                            control={form.control}
                            name="targetResponseTimeMs"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Target Response Time
                                    </FormLabel>
                                    <FormControl>
                                        <TargetResponseTimeSlider
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={updateApp.isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="active"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Active status
                                        </FormLabel>
                                        <FormDescription>
                                            Enable or disable data ingestion and monitoring for this app.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value ?? false}
                                            onCheckedChange={field.onChange}
                                            aria-label="App active status"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={updateApp.isPending}
                            >
                                {updateApp.isPending
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
