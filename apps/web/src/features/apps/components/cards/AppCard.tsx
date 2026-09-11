import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Copy, MoreHorizontal } from 'lucide-react';
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

interface AppCardProps {
    readonly app: AppResponseDto;
}

export function AppCard({ app }: AppCardProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleCopyClientId = (e: React.MouseEvent) => {
        e.stopPropagation();
        void navigator.clipboard.writeText(app.clientId);
        toast.success('Client key copied to clipboard');
    };

    return (
        <>
            <div className="group relative flex flex-col justify-between rounded-md border bg-card p-4 transition-colors duration-150 hover:border-border/80">
                <div className="space-y-3">
                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <Link
                                to="/apps/$appId"
                                params={{ appId: app.id }}
                                className="truncate block font-semibold text-base text-foreground hover:underline transition-colors tracking-tight"
                            >
                                {app.name}
                            </Link>
                            <span className="font-mono text-xs text-muted-foreground truncate block">
                                {app.slug}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <Badge
                                variant="outline"
                                className={
                                    app.active
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 font-medium'
                                        : 'text-muted-foreground font-medium'
                                }
                            >
                                {app.active ? 'Active' : 'Inactive'}
                            </Badge>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-md"
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

                    {/* Metadata & Framework */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                            {app.framework.name}
                        </span>
                        <span>·</span>
                        <span>{app.targetResponseTimeMs}ms target</span>
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="mt-4 flex items-center justify-end border-t pt-3 text-xs">
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-xs font-medium"
                    >
                        <Link to="/apps/$appId" params={{ appId: app.id }}>
                            Overview
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
