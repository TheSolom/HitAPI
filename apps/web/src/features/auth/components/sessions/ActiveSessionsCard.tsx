import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useActiveSessionsQuery } from '../../hooks';
import { SessionItem } from './SessionItem';

export function ActiveSessionsCard() {
    const { data: sessions = [], isLoading, isError } = useActiveSessionsQuery();

    let content: React.ReactNode;
    if (isLoading) {
        content = (
            <p className="text-xs text-muted-foreground">
                Loading active sessions...
            </p>
        );
    } else if (isError) {
        content = (
            <p className="text-xs text-destructive">
                Failed to load active sessions.
            </p>
        );
    } else if (sessions.length === 0) {
        content = (
            <p className="text-xs text-muted-foreground py-4 text-center">
                No active sessions found.
            </p>
        );
    } else {
        content = (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {sessions.map((session) => (
                    <SessionItem key={session.id} session={session} />
                ))}
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                    <span>Active Sessions</span>
                    <Badge variant="outline" className="font-normal text-xs">
                        {sessions.length}
                    </Badge>
                </CardTitle>
                <CardDescription>
                    Manage and revoke device sessions where your account is currently signed in.
                </CardDescription>
            </CardHeader>
            <CardContent>{content}</CardContent>
        </Card>
    );
}
