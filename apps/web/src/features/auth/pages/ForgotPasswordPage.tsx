import { Link } from '@tanstack/react-router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ForgotPasswordForm } from '../components';

export function ForgotPasswordPage() {
    return (
        <AuthLayout
            title="Reset your password"
            description="We'll email you a link to choose a new password."
            footer={
                <Link
                    to="/login"
                    className="font-medium text-primary hover:underline"
                >
                    Back to sign in
                </Link>
            }
        >
            <ForgotPasswordForm />
        </AuthLayout>
    );
}
