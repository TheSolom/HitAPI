import { Link, useNavigate } from '@tanstack/react-router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { RegisterForm } from '../components';

export function RegisterPage() {
    const navigate = useNavigate();

    return (
        <AuthLayout
            title="Create your HitAPI account"
            description="Start monitoring your APIs in a couple of minutes."
            footer={
                <span>
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="font-medium text-primary hover:underline"
                    >
                        Sign in
                    </Link>
                </span>
            }
        >
            <RegisterForm
                onSuccess={(email) => {
                    void navigate({
                        to: '/verify-email',
                        search: { email },
                    });
                }}
            />
        </AuthLayout>
    );
}
