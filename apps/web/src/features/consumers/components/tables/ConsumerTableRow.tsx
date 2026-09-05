import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
    Check,
    Clock,
    Copy,
    Edit,
    ExternalLink,
    Layers,
    MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import type { TrafficConsumersTableResponseDto } from '@hitapi/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { ConsumerAvatar } from '../avatar';
import { formatRelativeTime } from './table.utils';

export interface ConsumerTableRowProps {
    readonly consumer: TrafficConsumersTableResponseDto;
    readonly onEdit: (consumer: TrafficConsumersTableResponseDto) => void;
}

export function ConsumerTableRow({ consumer, onEdit }: ConsumerTableRowProps) {
    const [isCopied, setIsCopied] = useState(false);

    const displayName = consumer.name || consumer.identifier;
    const hasDistinctName =
        Boolean(consumer.name) && consumer.name !== consumer.identifier;

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        void navigator.clipboard.writeText(consumer.identifier);
        setIsCopied(true);
        toast.success(`Copied "${consumer.identifier}" to clipboard`);
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    };

    return (
        <TableRow className="group transition-colors hover:bg-muted/40">
            <TableCell className="pl-4">
                <div className="flex items-center gap-3">
                    <ConsumerAvatar
                        name={consumer.name}
                        identifier={consumer.identifier}
                    />
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <Link
                                to="/consumers/$consumerId"
                                params={{
                                    consumerId: String(consumer.id),
                                }}
                                className="font-medium text-foreground group-hover:text-primary transition-colors truncate block"
                            >
                                {displayName}
                            </Link>
                            {consumer.isNew ? (
                                <Badge
                                    variant="outline"
                                    className="px-1.5 py-0 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                >
                                    New
                                </Badge>
                            ) : null}
                        </div>
                        {hasDistinctName ? (
                            <span className="font-mono text-xs text-muted-foreground block truncate">
                                {consumer.identifier}
                            </span>
                        ) : null}
                    </div>
                </div>
            </TableCell>

            <TableCell>
                <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                    <span className="truncate max-w-42.5">
                        {consumer.identifier}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleCopy}
                        title="Copy identifier"
                    >
                        {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                            <Copy className="h-3.5 w-3.5" />
                        )}
                    </Button>
                </div>
            </TableCell>

            <TableCell className="text-center">
                {consumer.group ? (
                    <div className="inline-flex items-center justify-center">
                        <Badge
                            variant="secondary"
                            className="gap-1 font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                        >
                            <Layers className="h-3 w-3" />
                            {consumer.group.name}
                        </Badge>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                )}
            </TableCell>

            <TableCell className="text-center font-medium tabular-nums text-sm">
                {consumer.requests.toLocaleString()}
            </TableCell>

            <TableCell className="text-center font-medium tabular-nums text-sm">
                {consumer.errorRate > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        {consumer.errorRate}%
                    </span>
                ) : (
                    <span className="text-muted-foreground">0%</span>
                )}
            </TableCell>

            <TableCell className="text-center text-xs text-muted-foreground">
                <span className="inline-flex items-center justify-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                    {formatRelativeTime(consumer.lastRequestAt)}
                </span>
            </TableCell>

            <TableCell className="text-right pr-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            aria-label={`Actions for ${displayName}`}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link
                                to="/consumers/$consumerId"
                                params={{
                                    consumerId: String(consumer.id),
                                }}
                            >
                                <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                onEdit(consumer);
                            }}
                        >
                            <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                            Edit Consumer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleCopy}>
                            <Copy className="mr-2 h-4 w-4 text-muted-foreground" />
                            Copy Identifier
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}
