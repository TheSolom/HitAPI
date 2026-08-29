import { AlertTriangle } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { DeleteAccountDialog } from '../dialogs/DeleteAccountDialog';
import type { UserProfile } from '@hitapi/types';

interface DangerZoneCardProps {
    readonly user: UserProfile | null;
}

export function DangerZoneCard({ user }: DangerZoneCardProps) {
    return (
        <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Danger Zone</span>
                </CardTitle>
                <CardDescription>
                    Irreversible actions that affect your entire account credentials and workspace memberships.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                        Delete Personal Account
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Permanently removes your account, revoking active sessions and personal resources.
                    </p>
                </div>
                <DeleteAccountDialog user={user} />
            </CardContent>
        </Card>
    );
}
