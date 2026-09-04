import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { ApiError, applyFormErrors } from '@/lib/api/types';
import { registerSchema, type RegisterFormData } from '../../schemas';
import { useRegisterMutation } from '../../hooks';

import { GoogleButton } from '../social/GoogleButton';

interface RegisterFormProps {
    onSuccess?: (email: string) => void;
}

export function RegisterForm({ onSuccess }: Readonly<RegisterFormProps>) {
    const register = useRegisterMutation();

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            displayName: '',
            email: '',
            password: '',
        },
    });

    const onSubmit = (values: RegisterFormData) => {
        register.mutate(values, {
            onSuccess: () => {
                if (onSuccess) {
                    onSuccess(values.email);
                }
            },
            onError: (error) => {
                if (!applyFormErrors(form.setError, error)) {
                    if (error instanceof ApiError && error.isValidation) {
                        form.setError('email', { message: error.message });
                    }
                }
            },
        });
    };

    return (
        <div className="space-y-4">
            <Form {...form}>
                <form
                    onSubmit={(event) =>
                        void form.handleSubmit(onSubmit)(event)
                    }
                    className="space-y-4"
                    noValidate
                >
                    <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Display name</FormLabel>
                                <FormControl>
                                    <Input
                                        autoComplete="name"
                                        placeholder="Jane Doe"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                                        placeholder="jane@company.com"
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
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        autoComplete="new-password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Minimum 6 characters.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={register.isPending}
                    >
                        {register.isPending
                            ? 'Creating account...'
                            : 'Create account'}
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

            <GoogleButton text="Sign up with Google" />
        </div>
    );
}
