import { useState } from 'react';
import { Edit, Layers, MoreHorizontal, Trash2, Users } from 'lucide-react';
import type { ConsumerGroupResponseDto } from '@hitapi/types';
import { Button } from '@/components/ui/button';
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
            <div className="group relative flex flex-col justify-between rounded-md border bg-card p-4 transition-colors duration-150 hover:border-border/80">
                <div className="space-y-3">
                    {/* Header with Logo, Title, and Menu */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground mt-0.5">
                                <Layers className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base font-semibold text-foreground truncate block tracking-tight">
                                    {group.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                    <Users className="h-3 w-3 shrink-0 text-muted-foreground/80" />
                                    <span>
                                        {consumerCount.toLocaleString()}{' '}
                                        {consumerCount === 1
                                            ? 'consumer'
                                            : 'consumers'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-md"
                                    aria-label={`Open menu for ${group.name}`}
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
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
                </div>

                {/* Footer Action Bar with Members Button */}
                {appId && (
                    <div className="mt-4 flex items-center justify-between border-t pt-3">
                        <span className="text-[11px] font-mono text-muted-foreground">
                            Cohort #{group.id}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-xs font-medium gap-1.5"
                            onClick={() => {
                                setConsumersDialogOpen(true);
                            }}
                        >
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Members</span>
                        </Button>
                    </div>
                )}
            </div>

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
