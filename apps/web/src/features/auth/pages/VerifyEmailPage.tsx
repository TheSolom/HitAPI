import { useEffect } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { CheckCircle2, MailCheck } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { useVerifyEmailMutation } from '../hooks';
import { ResendVerificationForm } from '../components';

export function VerifyEmailPage() {
    const search = useSearch({ strict: false });
    const token =
        typeof search.token === 'string' && search.token
            ? search.token
            : undefined;

    const user = useAuthStore((s) => s.user);
    const emailParam = (search as { email?: unknown }).email;
    const searchEmail = typeof emailParam === 'string' ? emailParam : '';
    const email = searchEmail || user?.email || '';

    const verify = useVerifyEmailMutation();
    const { mutate } = verify;

    useEffect(() => {
        if (token) {
            mutate({ token });
        }
    }, [token, mutate]);

    let content: React.ReactNode;
    if (token) {
        if (verify.isPending) {
            content = (
                <p className="text-sm text-muted-foreground">
                    Verifying your email...
                </p>
            );
        } else if (verify.isSuccess) {
            content = (
                <div className="space-y-4">
                    <p className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2
                            className="h-4 w-4 text-primary"
                            aria-hidden="true"
                        />
                        Your email is verified. You can sign in now.
                    </p>
                    <Button asChild className="w-full">
                        <Link to="/login">Sign in</Link>
                    </Button>
                </div>
            );
        } else if (verify.isError) {
            content = (
                <div className="space-y-4">
                    <p className="text-sm text-destructive">
                        That verification link is invalid or has expired.
                        Request a new one below.
                    </p>
                    <ResendVerificationForm defaultEmail={email} />
                </div>
            );
        }
    } else {
        content = (
            <div className="space-y-4">
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MailCheck
                        className="mt-0.5 h-4 w-4 shrink-0"
                        aria-hidden="true"
                    />
                    {email ? (
                        <span>
                            We sent a verification link to{' '}
                            <strong className="text-foreground">{email}</strong>
                            {'.'} Open it to activate your account.
                        </span>
                    ) : (
                        <span>
                            We sent a verification link to your inbox. Open it
                            to activate your account.
                        </span>
                    )}
                </p>
                <ResendVerificationForm defaultEmail={email} />
            </div>
        );
    }

    return (
        <AuthLayout
            title="Verify your email"
            description="Confirming your address keeps alerting and team invites working."
            footer={
                <Link
                    to="/login"
                    className="font-medium text-primary hover:underline"
                >
                    Back to sign in
                </Link>
            }
        >
            {content}
        </AuthLayout>
    );
}
