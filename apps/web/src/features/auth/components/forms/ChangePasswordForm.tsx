import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, KeyRound } from 'lucide-react';
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
    changePasswordSchema,
    type ChangePasswordFormData,
} from '../../schemas';
import { useChangePasswordMutation } from '../../hooks';
import { applyFormErrors } from '@/lib/api';

export function ChangePasswordForm() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const changePassword = useChangePasswordMutation();

    const form = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (values: ChangePasswordFormData) => {
        changePassword.mutate(
            {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword,
            },
            {
                onSuccess: () => {
                    form.reset();
                },
                onError: (error) => {
                    applyFormErrors(form.setError, error);
                },
            },
        );
    };

    return (
        <Form {...form}>
            <form
                className="space-y-3.5"
                noValidate
                onSubmit={(event) => {
                    void form.handleSubmit(onSubmit)(event);
                }}
            >
                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Current password</span>
                            </FormLabel>
                            <div className="relative">
                                <FormControl>
                                    <Input
                                        type={
                                            showCurrentPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        autoComplete="current-password"
                                        className="pr-10"
                                        {...field}
                                    />
                                </FormControl>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCurrentPassword((prev) => !prev);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={
                                        showCurrentPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    }
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>New password</span>
                            </FormLabel>
                            <div className="relative">
                                <FormControl>
                                    <Input
                                        type={
                                            showNewPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        autoComplete="new-password"
                                        className="pr-10"
                                        {...field}
                                    />
                                </FormControl>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNewPassword((prev) => !prev);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={
                                        showNewPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    }
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Confirm new password</span>
                            </FormLabel>
                            <div className="relative">
                                <FormControl>
                                    <Input
                                        type={
                                            showConfirmPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        autoComplete="new-password"
                                        className="pr-10"
                                        {...field}
                                    />
                                </FormControl>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowConfirmPassword((prev) => !prev);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={
                                        showConfirmPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="pt-1">
                    <Button
                        type="submit"
                        disabled={changePassword.isPending}
                        className="w-full sm:w-auto"
                    >
                        {changePassword.isPending
                            ? 'Updating...'
                            : 'Update password'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
