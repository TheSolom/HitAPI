import { Link } from '@tanstack/react-router';
import {
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
    const displayName = consumer.name || consumer.identifier;
    const hasDistinctName =
        Boolean(consumer.name) && consumer.name !== consumer.identifier;

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        void navigator.clipboard.writeText(consumer.identifier);
        toast.success(`Copied "${consumer.identifier}" to clipboard`);
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
                                    className="px-1.5 py-0 text-[10px] font-medium"
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

            <TableCell className="text-center">
                {consumer.group ? (
                    <div className="inline-flex items-center justify-center">
                        <Badge
                            variant="outline"
                            className="gap-1 font-medium text-xs"
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
                    <span className="text-destructive">
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
