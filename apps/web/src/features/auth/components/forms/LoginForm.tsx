import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
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
import { ApiError, applyFormErrors } from '@/lib/api/types';
import { loginSchema, type LoginFormData } from '../../schemas';
import { useLoginMutation } from '../../hooks';

import { GoogleButton } from '../social/GoogleButton';

interface LoginFormProps {
    onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: Readonly<LoginFormProps>) {
    const login = useLoginMutation();

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = (values: LoginFormData) => {
        login.mutate(values, {
            onSuccess: () => {
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (error) => {
                if (!applyFormErrors(form.setError, error)) {
                    if (error instanceof ApiError && error.isValidation) {
                        form.setError('password', { message: error.message });
                    } else if (
                        error instanceof ApiError &&
                        error.isUnauthorized
                    ) {
                        form.setError('password', {
                            message: 'Incorrect email or password',
                        });
                    }
                }
            },
        });
    };

    return (
        <div className="space-y-4">
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
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Password</FormLabel>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs text-muted-foreground hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <FormControl>
                                    <Input
                                        type="password"
                                        autoComplete="current-password"
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
                        disabled={login.isPending}
                    >
                        {login.isPending ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>
            </Form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            <GoogleButton text="Continue with Google" />
        </div>
    );
}
