import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginForm } from '../components';

export function LoginPage() {
    const navigate = useNavigate();
    const search = useSearch({ strict: false });

    return (
        <AuthLayout
            title="Sign in to HitAPI"
            description="Monitor traffic, errors and performance across your APIs."
            footer={
                <span>
                    No account yet?{' '}
                    <Link
                        to="/register"
                        className="font-medium text-primary hover:underline"
                    >
                        Create one
                    </Link>
                </span>
            }
        >
            <LoginForm
                onSuccess={() => {
                    const redirectPath =
                        typeof search.redirect === 'string'
                            ? search.redirect
                            : '/apps';
                    void navigate({ to: redirectPath });
                }}
            />
        </AuthLayout>
    );
}
