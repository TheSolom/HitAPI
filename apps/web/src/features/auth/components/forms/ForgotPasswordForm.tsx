import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    forgotPasswordSchema,
    type ForgotPasswordFormData,
} from '../../schemas';
import { useRequestPasswordResetMutation } from '../../hooks';

interface ForgotPasswordFormProps {
    readonly onSuccess?: () => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
    const mutation = useRequestPasswordResetMutation();

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = (values: ForgotPasswordFormData) => {
        mutation.mutate(values, {
            onSuccess: () => {
                if (onSuccess) {
                    onSuccess();
                }
            },
        });
    };

    if (mutation.isSuccess) {
        return (
            <p className="text-sm text-muted-foreground">
                If an account exists for that address, a reset link is on its
                way. The link expires in 10 minutes.
            </p>
        );
    }

    return (
        <Form {...form}>
            <form
                onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
                className="space-y-4"
                noValidate
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@company.com"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="w-full"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? 'Sending...' : 'Send reset link'}
                </Button>
            </form>
        </Form>
    );
}
