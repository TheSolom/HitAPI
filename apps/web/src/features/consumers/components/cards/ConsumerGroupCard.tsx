import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
    ArrowRight,
    Edit,
    Layers,
    MoreVertical,
    Trash2,
    Users,
} from 'lucide-react';
import type { ConsumerGroupResponseDto } from '@hitapi/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GroupConsumersDialog } from '../dialogs/GroupConsumersDialog';

interface ConsumerGroupCardProps {
    readonly appId?: string;
    readonly group: ConsumerGroupResponseDto;
    readonly onEdit?: (group: ConsumerGroupResponseDto) => void;
    readonly onDelete?: (group: ConsumerGroupResponseDto) => void;
}

export function ConsumerGroupCard({
    appId,
    group,
    onEdit,
    onDelete,
}: ConsumerGroupCardProps) {
    const [consumersDialogOpen, setConsumersDialogOpen] = useState(false);
    const consumerCount = group.consumerCount ?? 0;

    return (
        <>
            <Card className="group relative flex flex-col justify-between overflow-hidden border-border/70 bg-linear-to-br from-card via-card to-violet-500/5 p-5 transition-all duration-300 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5 rounded-2xl">
                <div className="space-y-4">
                    {/* Header with Icon and Menu */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 group-hover:scale-105 group-hover:bg-violet-500/15 transition-all">
                                <Layers className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <CardTitle className="text-base font-semibold text-foreground truncate block tracking-tight">
                                    {group.name}
                                </CardTitle>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
                                    aria-label={`Open menu for ${group.name}`}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-44 shadow-lg border-border/80"
                            >
                                {onEdit && (
                                    <DropdownMenuItem
                                        onClick={() => {
                                            onEdit(group);
                                        }}
                                    >
                                        <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                                        Edit Name
                                    </DropdownMenuItem>
                                )}
                                {onDelete && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => {
                                                onDelete(group);
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Group
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Interactive Cohort Members Row */}
                    <button
                        type="button"
                        onClick={() => {
                            if (appId) {
                                setConsumersDialogOpen(true);
                            }
                        }}
                        className="w-full flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-violet-500/30 px-3.5 py-2.5 text-xs transition-all text-left group/row cursor-pointer"
                        title="Click to view assigned consumers"
                    >
                        <span className="text-muted-foreground flex items-center gap-2 font-medium group-hover/row:text-foreground transition-colors">
                            <Users className="h-3.5 w-3.5 text-violet-500" />
                            <span>Consumers Info</span>
                        </span>
                        <Badge
                            variant="secondary"
                            className="font-mono text-xs font-semibold px-2 py-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                        >
                            {consumerCount.toLocaleString()}{' '}
                            {consumerCount === 1 ? 'client' : 'clients'}
                        </Badge>
                    </button>
                </div>

                {/* Footer Action Button */}
                {appId && (
                    <div className="pt-4 mt-3 border-t">
                        <Button
                            asChild
                            variant="default"
                            size="sm"
                            className="h-8 text-xs font-semibold w-full rounded-lg shadow-2xs gap-1.5"
                        >
                            <Link
                                to="/consumers"
                                search={{
                                    appId,
                                    groupId: String(group.id),
                                }}
                            >
                                <span>Telemetry</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </div>
                )}
            </Card>

            {/* Group Consumers Centered Dialog */}
            {appId && (
                <GroupConsumersDialog
                    appId={appId}
                    group={group}
                    open={consumersDialogOpen}
                    onOpenChange={setConsumersDialogOpen}
                />
            )}
        </>
    );
}
