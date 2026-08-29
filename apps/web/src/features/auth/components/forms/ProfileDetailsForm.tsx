import { User, Mail, ShieldCheck, AlertCircle } from 'lucide-react';
import type { UserProfile } from '@hitapi/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useResendVerificationMutation } from '../../hooks';

interface ProfileDetailsFormProps {
    user: UserProfile | null;
}

function getInitials(name?: string, email?: string): string {
    const source = name || email || 'U';
    return source
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function ProfileDetailsForm({
    user,
}: Readonly<ProfileDetailsFormProps>) {
    const resendVerification = useResendVerificationMutation();

    const isVerified = Boolean(user?.isVerified);
    const initials = getInitials(user?.displayName, user?.email);

    return (
        <div className="space-y-4">
            {/* User Profile Mini Banner */}
            <div className="flex items-center gap-3.5 rounded-lg border bg-muted/20 p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-xs">
                    {initials}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground truncate">
                            {user?.displayName || 'Unnamed User'}
                        </p>
                        {isVerified ? (
                            <Badge
                                variant="outline"
                                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] h-4.5 px-1.5 font-medium gap-1"
                            >
                                <ShieldCheck className="h-3 w-3" />
                                Verified
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] h-4.5 px-1.5 font-medium gap-1"
                            >
                                <AlertCircle className="h-3 w-3" />
                                Unverified
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                        {user?.email || 'No email associated'}
                    </p>
                </div>
            </div>

            {/* Profile Fields */}
            <div className="space-y-3">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span>Full name</span>
                    </label>
                    <div className="flex h-9 w-full items-center rounded-md border bg-muted/30 px-3 text-sm text-foreground">
                        {user?.displayName || 'Unnamed User'}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <span>Email address</span>
                    </label>
                    <div className="flex h-9 w-full items-center rounded-md border bg-muted/30 px-3 text-sm text-foreground">
                        {user?.email || '—'}
                    </div>
                </div>
            </div>

            {!isVerified && user?.email && (
                <div className="pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                            if (user.email) {
                                resendVerification.mutate({
                                    email: user.email,
                                });
                            }
                        }}
                        disabled={resendVerification.isPending}
                    >
                        {resendVerification.isPending
                            ? 'Sending...'
                            : 'Resend verification email'}
                    </Button>
                </div>
            )}
        </div>
    );
}
