import { useEffect, useState } from 'react';
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
    resendVerificationSchema,
    type ResendVerificationFormData,
} from '../../schemas';
import { useResendVerificationMutation } from '../../hooks';

interface ResendVerificationFormProps {
    defaultEmail?: string;
    onSent?: () => void;
}

export function ResendVerificationForm({
    defaultEmail = '',
    onSent,
}: Readonly<ResendVerificationFormProps>) {
    const [cooldown, setCooldown] = useState(0);
    const [isCustomEmail, setIsCustomEmail] = useState(false);
    const resend = useResendVerificationMutation();

    const form = useForm<ResendVerificationFormData>({
        resolver: zodResolver(resendVerificationSchema),
        values: { email: defaultEmail },
    });

    useEffect(() => {
        if (cooldown <= 0) {
            return;
        }
        const timer = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);
        return () => {
            clearInterval(timer);
        };
    }, [cooldown]);

    const handleSend = (values: ResendVerificationFormData) => {
        resend.mutate(
            { email: values.email },
            {
                onSuccess: () => {
                    setCooldown(60);
                    if (onSent) {
                        onSent();
                    }
                },
            },
        );
    };

    const isPending = resend.isPending;
    const isCooldownActive = cooldown > 0;
    const isDisabled = isPending || isCooldownActive;

    let buttonText = 'Resend verification email';
    if (isPending) {
        buttonText = 'Sending...';
    } else if (isCooldownActive) {
        buttonText = `Resend in ${String(cooldown)}s`;
    }

    if (!isCustomEmail && defaultEmail) {
        return (
            <div className="space-y-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isDisabled}
                    onClick={() => {
                        handleSend({ email: defaultEmail });
                    }}
                >
                    {buttonText}
                </Button>
                <div className="text-center">
                    <button
                        type="button"
                        className="text-xs text-muted-foreground hover:underline cursor-pointer"
                        onClick={() => {
                            setIsCustomEmail(true);
                        }}
                    >
                        Send to a different email address
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form
                onSubmit={(event) => void form.handleSubmit(handleSend)(event)}
                className="space-y-4 pt-2"
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
                    variant="outline"
                    className="w-full"
                    disabled={isDisabled}
                >
                    {buttonText}
                </Button>
            </form>
        </Form>
    );
}
