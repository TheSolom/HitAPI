import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Check,
    Clock,
    Copy,
    Edit,
    ExternalLink,
    Layers,
    MoreHorizontal,
    RotateCcw,
    Search,
    Sparkles,
    User,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    OrderDirection,
    type ConsumerGroupResponseDto,
    type Period,
    type TrafficConsumersTableResponseDto,
} from '@hitapi/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { LoadingRows } from '@/components/states/LoadingState';
import { ConsumerAvatar } from '../avatar';
import { EditConsumerDialog } from '../dialogs/EditConsumerDialog';
import { useConsumersTableQuery } from '../../hooks';

type SortField = 'name' | 'requests' | 'errorRate' | 'lastRequest';

interface SortIconProps {
    readonly column: SortField;
    readonly sortBy: SortField;
    readonly order: OrderDirection;
}

function SortIcon({ column, sortBy, order }: SortIconProps) {
    if (sortBy !== column) {
        return (
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
        );
    }
    if (order === OrderDirection.ASC) {
        return (
            <ArrowUp className="h-3.5 w-3.5 text-primary animate-in fade-in-50 duration-200" />
        );
    }
    return (
        <ArrowDown className="h-3.5 w-3.5 text-primary animate-in fade-in-50 duration-200" />
    );
}

interface ConsumersTableProps {
    readonly appId: string;
    readonly period?: Period;
    readonly groups?: ConsumerGroupResponseDto[];
    readonly initialGroupId?: string;
}

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleTimeString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function ConsumersTable({
    appId,
    period,
    groups = [],
    initialGroupId,
}: ConsumersTableProps) {
    const [selectedConsumer, setSelectedConsumer] =
        useState<TrafficConsumersTableResponseDto | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>(
        initialGroupId ?? 'all',
    );
    const [onlyNew, setOnlyNew] = useState(false);
    const [sortBy, setSortBy] = useState<SortField>('requests');
    const [order, setOrder] = useState<OrderDirection>(OrderDirection.DESC);
    const [copiedIdentifier, setCopiedIdentifier] = useState<string | null>(
        null,
    );

    const [prevInitialGroupId, setPrevInitialGroupId] =
        useState(initialGroupId);
    if (initialGroupId !== prevInitialGroupId) {
        setPrevInitialGroupId(initialGroupId);
        if (initialGroupId !== undefined && initialGroupId !== '') {
            setSelectedGroupFilter(initialGroupId);
        }
    }

    const consumerGroupId =
        selectedGroupFilter !== 'all' && selectedGroupFilter !== 'unassigned'
            ? Number.parseInt(selectedGroupFilter, 10)
            : undefined;

    const activeFiltersCount =
        (selectedGroupFilter !== 'all' ? 1 : 0) +
        (onlyNew ? 1 : 0) +
        (search ? 1 : 0);

    const tableQuery = useConsumersTableQuery({
        appId,
        period,
        consumerGroupId,
        search: search.trim() || undefined,
        onlyNew: onlyNew || undefined,
        sortBy,
        order,
    });

    const consumers = tableQuery.data ?? [];

    const handleCopy = (identifier: string, e: React.MouseEvent) => {
        e.stopPropagation();
        void navigator.clipboard.writeText(identifier);
        setCopiedIdentifier(identifier);
        toast.success(`Copied "${identifier}" to clipboard`);
        setTimeout(() => {
            setCopiedIdentifier(null);
        }, 2000);
    };

    const handleEdit = (consumer: TrafficConsumersTableResponseDto) => {
        setSelectedConsumer(consumer);
        setEditDialogOpen(true);
    };

    const handleSort = (column: SortField) => {
        if (sortBy === column) {
            setOrder((prev) =>
                prev === OrderDirection.ASC
                    ? OrderDirection.DESC
                    : OrderDirection.ASC,
            );
        } else {
            setSortBy(column);
            setOrder(OrderDirection.DESC);
        }
    };

    const getAriaSort = (column: SortField) => {
        if (sortBy !== column) return 'none';
        return order === OrderDirection.ASC ? 'ascending' : 'descending';
    };

    const resetFilters = () => {
        setSearch('');
        setSelectedGroupFilter('all');
        setOnlyNew(false);
    };

    return (
        <div className="space-y-4">
            {/* Filter & Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or identifier..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                        className="pl-8.5 pr-8 h-9 text-sm"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                            }}
                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Quick New Client Pill */}
                    <Button
                        variant={onlyNew ? 'default' : 'outline'}
                        size="sm"
                        className="h-9 gap-1.5 text-xs font-medium"
                        onClick={() => {
                            setOnlyNew((prev) => !prev);
                        }}
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Only New</span>
                    </Button>

                    {/* Group Filter Dropdown */}
                    <Select
                        value={selectedGroupFilter}
                        onValueChange={(val) => {
                            setSelectedGroupFilter(val);
                        }}
                    >
                        <SelectTrigger className="h-9 w-40 sm:w-48 text-xs sm:text-sm">
                            <SelectValue placeholder="All groups" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Groups</SelectItem>
                            {groups.map((group) => (
                                <SelectItem
                                    key={group.id}
                                    value={group.id.toString()}
                                >
                                    {group.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Reset Button (shows if filters active) */}
                    {activeFiltersCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                            onClick={resetFilters}
                            title="Reset all filters"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reset</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Table or States */}
            {tableQuery.isLoading && consumers.length === 0 && <LoadingRows />}

            {!tableQuery.isLoading && consumers.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-foreground">
                        No consumers found
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                        {activeFiltersCount > 0
                            ? 'No consumers match your active filters. Try adjusting your search query, group filter, or new client toggle.'
                            : 'No consumers reported traffic in this period yet.'}
                    </p>
                    {activeFiltersCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-3 text-xs gap-1.5"
                            onClick={resetFilters}
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reset filters</span>
                        </Button>
                    )}
                </div>
            )}

            {consumers.length > 0 && (
                <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
                    <Table>
                        <caption className="sr-only">
                            Consumer traffic telemetry and reliability
                        </caption>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead
                                    scope="col"
                                    aria-sort={getAriaSort('name')}
                                    className="group cursor-pointer select-none pl-4 transition-colors hover:text-foreground"
                                    onClick={() => {
                                        handleSort('name');
                                    }}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className={cn(
                                                'transition-colors',
                                                sortBy === 'name'
                                                    ? 'font-semibold text-foreground'
                                                    : 'text-muted-foreground group-hover:text-foreground',
                                            )}
                                        >
                                            Consumer
                                        </span>
                                        <SortIcon
                                            column="name"
                                            sortBy={sortBy}
                                            order={order}
                                        />
                                    </div>
                                </TableHead>
                                <TableHead scope="col">Identifier</TableHead>
                                <TableHead scope="col" className="text-center">
                                    Group
                                </TableHead>
                                <TableHead
                                    scope="col"
                                    aria-sort={getAriaSort('requests')}
                                    className="group text-center tabular-nums cursor-pointer select-none transition-colors hover:text-foreground"
                                    onClick={() => {
                                        handleSort('requests');
                                    }}
                                >
                                    <div className="flex items-center justify-center gap-1.5">
                                        <span
                                            className={cn(
                                                'transition-colors',
                                                sortBy === 'requests'
                                                    ? 'font-semibold text-foreground'
                                                    : 'text-muted-foreground group-hover:text-foreground',
                                            )}
                                        >
                                            Requests
                                        </span>
                                        <SortIcon
                                            column="requests"
                                            sortBy={sortBy}
                                            order={order}
                                        />
                                    </div>
                                </TableHead>
                                <TableHead
                                    scope="col"
                                    aria-sort={getAriaSort('errorRate')}
                                    className="group text-center tabular-nums cursor-pointer select-none transition-colors hover:text-foreground"
                                    onClick={() => {
                                        handleSort('errorRate');
                                    }}
                                >
                                    <div className="flex items-center justify-center gap-1.5">
                                        <span
                                            className={cn(
                                                'transition-colors',
                                                sortBy === 'errorRate'
                                                    ? 'font-semibold text-foreground'
                                                    : 'text-muted-foreground group-hover:text-foreground',
                                            )}
                                        >
                                            Error Rate
                                        </span>
                                        <SortIcon
                                            column="errorRate"
                                            sortBy={sortBy}
                                            order={order}
                                        />
                                    </div>
                                </TableHead>
                                <TableHead
                                    scope="col"
                                    aria-sort={getAriaSort('lastRequest')}
                                    className="group text-center cursor-pointer select-none transition-colors hover:text-foreground"
                                    onClick={() => {
                                        handleSort('lastRequest');
                                    }}
                                >
                                    <div className="flex items-center justify-center gap-1.5">
                                        <span
                                            className={cn(
                                                'transition-colors',
                                                sortBy === 'lastRequest'
                                                    ? 'font-semibold text-foreground'
                                                    : 'text-muted-foreground group-hover:text-foreground',
                                            )}
                                        >
                                            Last Active
                                        </span>
                                        <SortIcon
                                            column="lastRequest"
                                            sortBy={sortBy}
                                            order={order}
                                        />
                                    </div>
                                </TableHead>
                                <TableHead
                                    scope="col"
                                    className="w-14 text-right pr-4"
                                >
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {consumers.map((consumer) => {
                                const displayName =
                                    consumer.name || consumer.identifier;
                                const isCopied =
                                    copiedIdentifier === consumer.identifier;
                                const hasDistinctName =
                                    consumer.name &&
                                    consumer.name !== consumer.identifier;

                                return (
                                    <TableRow
                                        key={consumer.id}
                                        className="group transition-colors hover:bg-muted/40"
                                    >
                                        <TableCell className="pl-4">
                                            <div className="flex items-center gap-3">
                                                <ConsumerAvatar
                                                    name={consumer.name}
                                                    identifier={
                                                        consumer.identifier
                                                    }
                                                />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <Link
                                                            to="/consumers/$consumerId"
                                                            params={{
                                                                consumerId:
                                                                    String(
                                                                        consumer.id,
                                                                    ),
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
                                                            {
                                                                consumer.identifier
                                                            }
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                                                <span className="truncate max-w-[170px]">
                                                    {consumer.identifier}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => {
                                                        handleCopy(
                                                            consumer.identifier,
                                                            e,
                                                        );
                                                    }}
                                                    title="Copy identifier"
                                                >
                                                    {isCopied ? (
                                                        <Check className="h-3 w-3 text-emerald-500" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
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
                                                <span className="text-xs text-muted-foreground">
                                                    —
                                                </span>
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
                                                <span className="text-muted-foreground">
                                                    0%
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-center text-xs text-muted-foreground">
                                            <span className="inline-flex items-center justify-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                                                {formatRelativeTime(
                                                    consumer.lastRequestAt,
                                                )}
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
                                                                consumerId:
                                                                    String(
                                                                        consumer.id,
                                                                    ),
                                                            }}
                                                        >
                                                            <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            handleEdit(
                                                                consumer,
                                                            );
                                                        }}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        Edit Consumer
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            handleCopy(
                                                                consumer.identifier,
                                                                e,
                                                            );
                                                        }}
                                                    >
                                                        <Copy className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        Copy Identifier
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Edit Consumer Dialog */}
            {selectedConsumer ? (
                <EditConsumerDialog
                    appId={appId}
                    consumer={selectedConsumer}
                    open={editDialogOpen}
                    onOpenChange={(open) => {
                        setEditDialogOpen(open);
                        if (!open) {
                            setSelectedConsumer(null);
                        }
                    }}
                />
            ) : null}
        </div>
    );
}
