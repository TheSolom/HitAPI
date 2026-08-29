import { format, parseISO } from 'date-fns';
import { Copy, Eye, EyeOff, Key, Server, Timer } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { AppResponseDto } from '@hitapi/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface AppConfigCardProps {
    readonly app: AppResponseDto;
}

function formatDate(value?: Date | string | null): string {
    if (!value) return 'Unknown';
    try {
        const date = typeof value === 'string' ? parseISO(value) : value;
        return format(date, 'd MMM yyyy, HH:mm');
    } catch {
        return String(value);
    }
}

function maskClientId(clientId: string): string {
    if (clientId.length <= 8) return '*'.repeat(clientId.length);
    return `${clientId.slice(0, 4)}${'*'.repeat(Math.min(12, clientId.length - 8))}${clientId.slice(-4)}`;
}

export function AppConfigCard({ app }: AppConfigCardProps) {
    const [isClientIdVisible, setIsClientIdVisible] = useState(false);

    const handleCopyClientId = () => {
        void navigator.clipboard.writeText(app.clientId);
        toast.success('Client ID copied to clipboard');
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardTitle className="text-base">
                            App Configuration
                        </CardTitle>
                        <CardDescription>
                            SDK credentials and performance configuration
                        </CardDescription>
                    </div>
                    <Badge
                        variant={app.active ? 'default' : 'secondary'}
                        className={
                            app.active
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 gap-1.5 font-medium'
                                : 'gap-1.5 font-medium'
                        }
                    >
                        <span
                            className={
                                app.active
                                    ? 'h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse'
                                    : 'h-1.5 w-1.5 rounded-full bg-muted-foreground'
                            }
                        />
                        {app.active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Framework
                        </span>
                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                            <Server className="h-4 w-4 text-muted-foreground" />
                            {app.framework.name}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Target Response Time
                        </span>
                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                            <Timer className="h-4 w-4 text-muted-foreground" />
                            {app.targetResponseTimeMs} ms
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Created At
                        </span>
                        <div className="text-sm font-semibold">
                            {formatDate(app.createdAt)}
                        </div>
                    </div>
                </div>

                <div className="rounded-md border bg-muted/40 p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Key className="h-3.5 w-3.5" />
                                Client Key (SDK Ingestion)
                            </div>
                            <p className="truncate font-mono text-xs font-semibold">
                                {isClientIdVisible
                                    ? app.clientId
                                    : maskClientId(app.clientId)}
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setIsClientIdVisible(
                                        (isVisible) => !isVisible,
                                    );
                                }}
                                aria-label={
                                    isClientIdVisible
                                        ? 'Hide client key'
                                        : 'Reveal client key'
                                }
                                title={
                                    isClientIdVisible
                                        ? 'Hide client key'
                                        : 'Reveal client key'
                                }
                            >
                                {isClientIdVisible ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={handleCopyClientId}
                            >
                                <Copy className="h-3.5 w-3.5" />
                                Copy Key
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
