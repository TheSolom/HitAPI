import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    updateEndpointErrorConfigSchema,
    type UpdateEndpointErrorConfigFormValues,
} from '../schemas';
import { useUpdateEndpointErrorConfigMutation } from '../hooks';

interface EndpointErrorConfigDialogProps {
    readonly appId: string;
    readonly endpoint: EndpointResponseDto;
    readonly trigger?: React.ReactNode;
    readonly open?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
}

export function EndpointErrorConfigDialog({
    appId,
    endpoint,
    trigger,
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
}: EndpointErrorConfigDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen ?? internalOpen;
    const setIsOpen = externalOnOpenChange ?? setInternalOpen;
    const updateErrorConfig = useUpdateEndpointErrorConfigMutation();

    const form = useForm<UpdateEndpointErrorConfigFormValues>({
        resolver: zodResolver(updateEndpointErrorConfigSchema),
        defaultValues: {
            method: endpoint.method,
            path: endpoint.path,
            statusCode: 404,
            expected: true,
        },
    });

    const handleSubmit = (values: UpdateEndpointErrorConfigFormValues) => {
        updateErrorConfig.mutate(
            {
                appId,
                payload: {
                    method: endpoint.method,
                    path: endpoint.path,
                    statusCode: values.statusCode,
                    expected: values.expected,
                },
            },
            {
                onSuccess: () => {
                    setIsOpen(false);
                },
            },
        );
    };

    const defaultTrigger = (
        <Button
            variant="ghost"
            size="sm"
            aria-label="Configure error policy"
        >
            <AlertTriangle className="h-4 w-4" />
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
                        Configure whether specific HTTP status codes count as
                        expected business errors (not degrading service health).
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
                            name="statusCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>HTTP Status Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="404"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(
                                                    Number(e.target.value),
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        HTTP status code between 100 and 599.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="expected"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Mark as expected
                                        </FormLabel>
                                        <FormDescription>
                                            Expected errors won't trigger alert
                                            incidents or lower reliability
                                            scores.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            aria-label="Mark error as expected"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={updateErrorConfig.isPending}
                            >
                                {updateErrorConfig.isPending
                                    ? 'Saving...'
                                    : 'Save policy'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
