import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
    Server,
    Clock,
    Key,
    Copy,
    Check,
    MoreHorizontal,
    Network,
    ArrowRight,
    Activity,
    AlertTriangle,
    FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AppResponseDto } from '@hitapi/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditAppDialog } from '../dialogs/EditAppDialog';
import { DeleteAppDialog } from '../dialogs/DeleteAppDialog';
import { AppConsumersPopover } from '../popovers/AppConsumersPopover';

interface AppCardProps {
    readonly app: AppResponseDto;
}

export function AppCard({ app }: AppCardProps) {
    const [copied, setCopied] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleCopyClientId = (e: React.MouseEvent) => {
        e.stopPropagation();
        void navigator.clipboard.writeText(app.clientId);
        setCopied(true);
        toast.success('Client key copied to clipboard');
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <>
            <div className="group relative flex flex-col justify-between rounded-xl border bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md">
                <div className="space-y-4">
                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/60 text-primary group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                                <Server className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <Link
                                    to="/apps/$appId"
                                    params={{ appId: app.id }}
                                    className="truncate block font-semibold text-foreground group-hover:text-primary transition-colors"
                                >
                                    {app.name}
                                </Link>
                                <span className="font-mono text-xs text-muted-foreground truncate block">
                                    {app.slug}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
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

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        aria-label={`Options for ${app.name}`}
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link
                                            to="/apps/$appId"
                                            params={{ appId: app.id }}
                                        >
                                            <ArrowRight className="mr-2 h-4 w-4 text-muted-foreground" />
                                            Open Overview
                                        </Link>
                                    </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                handleCopyClientId(e);
                                            }}
                                        >
                                            <Copy className="mr-2 h-4 w-4 text-muted-foreground" />
                                            Copy Client Key
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setEditDialogOpen(true);
                                        }}
                                    >
                                        Edit Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setDeleteDialogOpen(true);
                                        }}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        Delete App
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Metadata & Key Info */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2.5 py-1.5 text-xs">
                            <Server className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">
                                Framework:
                            </span>
                            <span className="font-medium truncate">
                                {app.framework.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2.5 py-1.5 text-xs">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">
                                Target:
                            </span>
                            <span className="font-medium">
                                {app.targetResponseTimeMs}ms
                            </span>
                        </div>
                    </div>

                    {/* Client Key Box */}
                    <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                            <Key className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-mono text-muted-foreground truncate">
                                {app.clientId.slice(0, 8)}...
                                {app.clientId.slice(-4)}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                            onClick={(e) => {
                                handleCopyClientId(e);
                            }}
                            title="Copy Client Key"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3 w-3 text-emerald-500" />
                                    <span className="text-emerald-500">
                                        Copied
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copy</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Footer Action Bar */}
                {/* Footer Action Bar */}
                <div className="mt-5 flex items-center justify-between border-t pt-3.5 gap-2 min-w-0 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-0.5 text-muted-foreground min-w-0">
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Traffic Analytics"
                        >
                            <Link to="/traffic" search={{ appId: app.id }}>
                                <Activity className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Error Logs"
                        >
                            <Link to="/errors" search={{ appId: app.id }}>
                                <AlertTriangle className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Request Logs"
                        >
                            <Link to="/logs" search={{ appId: app.id }}>
                                <FileText className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Endpoints"
                        >
                            <Link to="/endpoints" search={{ appId: app.id }}>
                                <Network className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                        <AppConsumersPopover appId={app.id} appName={app.name} />
                    </div>

                    <Button
                        asChild
                        size="sm"
                        className="h-7 px-3 text-xs font-semibold shrink-0 gap-1"
                    >
                        <Link to="/apps/$appId" params={{ appId: app.id }}>
                            <span>Overview</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </div>
            </div>

            <EditAppDialog
                app={app}
                trigger={null}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
            />

            <DeleteAppDialog
                appId={app.id}
                appName={app.name}
                trigger={null}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            />
        </>
    );
}

