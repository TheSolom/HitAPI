import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ResetPasswordForm } from '../components';

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const search = useSearch({ strict: false });
    const token = typeof search.token === 'string' ? search.token : '';

    return (
        <AuthLayout
            title="Choose a new password"
            description="Set a new password for your HitAPI account."
            footer={
                <Link
                    to="/login"
                    className="font-medium text-primary hover:underline"
                >
                    Back to sign in
                </Link>
            }
        >
            {!token ? (
                <p className="text-sm text-muted-foreground">
                    This reset link is missing its token. Request a new link
                    from the forgot password page.
                </p>
            ) : (
                <ResetPasswordForm
                    token={token}
                    onSuccess={() => {
                        void navigate({ to: '/login' });
                    }}
                />
            )}
        </AuthLayout>
    );
}
