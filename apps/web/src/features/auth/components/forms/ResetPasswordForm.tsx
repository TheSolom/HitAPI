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
import { ApiError } from '@/lib/api/types';
import { resetPasswordSchema, type ResetPasswordFormData } from '../../schemas';
import { useResetPasswordMutation } from '../../hooks';

interface ResetPasswordFormProps {
    token: string;
    onSuccess?: () => void;
}

export function ResetPasswordForm({
    token,
    onSuccess,
}: Readonly<ResetPasswordFormProps>) {
    const mutation = useResetPasswordMutation();

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { newPassword: '', confirmPassword: '' },
    });

    const onSubmit = (values: ResetPasswordFormData) => {
        mutation.mutate(
            {
                token,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword,
            },
            {
                onSuccess: () => {
                    if (onSuccess) {
                        onSuccess();
                    }
                },
                onError: (error) => {
                    if (error instanceof ApiError) {
                        form.setError('newPassword', {
                            message: error.message,
                        });
                    }
                },
            },
        );
    };

    return (
        <Form {...form}>
            <form
                className="space-y-4"
                noValidate
                onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
            >
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    autoComplete="new-password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm new password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    autoComplete="new-password"
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
                    {mutation.isPending ? 'Saving...' : 'Save new password'}
                </Button>
            </form>
        </Form>
    );
}
