import { Monitor, Smartphone, Tablet, AppWindow, Trash2 } from 'lucide-react';
import type { UserSession } from '@hitapi/types';
import { Button } from '@/components/ui/button';
import { useRevokeSessionMutation } from '../../hooks';
import { parseUserAgent } from '../../utils/parse-user-agent';

interface SessionItemProps {
    session: UserSession;
}

function getDeviceIcon(deviceType: string) {
    switch (deviceType) {
        case 'mobile':
            return <Smartphone className="h-4 w-4" aria-hidden="true" />;
        case 'tablet':
            return <Tablet className="h-4 w-4" aria-hidden="true" />;
        case 'app':
            return <AppWindow className="h-4 w-4" aria-hidden="true" />;
        case 'desktop':
        default:
            return <Monitor className="h-4 w-4" aria-hidden="true" />;
    }
}

export function SessionItem({ session }: Readonly<SessionItemProps>) {
    const revoke = useRevokeSessionMutation();
    const parsedDevice = parseUserAgent(session.deviceInfo);

    const createdDate = session.createdAt
        ? new Date(session.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : 'Unknown';

    const lastActiveDate = session.lastUsedAt
        ? new Date(session.lastUsedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : null;

    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 p-3 transition-colors hover:bg-muted/30">
            <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background text-primary shadow-xs">
                    {getDeviceIcon(parsedDevice.deviceType)}
                </div>
                <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                        {parsedDevice.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        IP:{' '}
                        <span className="font-mono">
                            {session.ipAddress ?? 'Unknown'}
                        </span>{' '}
                        • Created: {createdDate}
                        {lastActiveDate && ` • Last active: ${lastActiveDate}`}
                    </p>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0"
                onClick={() => {
                    revoke.mutate(session.id);
                }}
                disabled={revoke.isPending}
                aria-label="Revoke session"
                title="Revoke this session"
            >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Revoke session</span>
            </Button>
        </div>
    );
}
