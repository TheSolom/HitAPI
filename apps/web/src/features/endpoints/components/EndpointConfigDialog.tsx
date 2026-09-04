import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SlidersHorizontal } from 'lucide-react';
import type { EndpointResponseDto } from '@hitapi/types';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { TargetResponseTimeSlider } from '@/components/common/target-response-time-slider';
import { applyFormErrors } from '@/lib/api';
import {
    updateEndpointConfigSchema,
    type UpdateEndpointConfigFormValues,
} from '../schemas';
import { useUpdateEndpointConfigMutation } from '../hooks';

interface EndpointConfigDialogProps {
    readonly appId: string;
    readonly endpoint: EndpointResponseDto;
    readonly trigger?: React.ReactNode;
    readonly open?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
}

export function EndpointConfigDialog({
    appId,
    endpoint,
    trigger,
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
}: EndpointConfigDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen ?? internalOpen;
    const setIsOpen = externalOnOpenChange ?? setInternalOpen;
    const updateConfig = useUpdateEndpointConfigMutation();

    const form = useForm<UpdateEndpointConfigFormValues>({
        resolver: zodResolver(updateEndpointConfigSchema),
        defaultValues: {
            method: endpoint.method,
            path: endpoint.path,
            excluded: endpoint.excluded,
            targetResponseTimeMs: endpoint.targetResponseTimeMs ?? 500,
        },
    });

    const handleSubmit = (values: UpdateEndpointConfigFormValues) => {
        updateConfig.mutate(
            {
                appId,
                payload: {
                    method: endpoint.method,
                    path: endpoint.path,
                    excluded: values.excluded,
                    targetResponseTimeMs:
                        values.targetResponseTimeMs ?? undefined,
                },
            },
            {
                onSuccess: () => {
                    setIsOpen(false);
                },
                onError: (error) => {
                    applyFormErrors(form.setError, error);
                },
            },
        );
    };

    const defaultTrigger = (
        <Button variant="ghost" size="sm" aria-label="Configure endpoint">
            <SlidersHorizontal className="h-4 w-4" />
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger ? (
                <DialogTrigger asChild>{trigger}</DialogTrigger>
            ) : (
                defaultTrigger
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <span className="font-mono text-sm">
                            {endpoint.path}
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        Configure latency threshold and monitoring status for
                        this route.
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
                            name="targetResponseTimeMs"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Response Time</FormLabel>
                                    <FormControl>
                                        <TargetResponseTimeSlider
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={updateConfig.isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="excluded"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Exclude from monitoring
                                        </FormLabel>
                                        <FormDescription>
                                            When enabled, metrics and logs for
                                            this route will be ignored.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value ?? false}
                                            onCheckedChange={field.onChange}
                                            aria-label="Exclude endpoint from monitoring"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={updateConfig.isPending}
                            >
                                {updateConfig.isPending
                                    ? 'Saving...'
                                    : 'Save settings'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
