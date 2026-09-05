import { useState } from 'react';
import {
    OrderDirection,
    type ConsumerGroupResponseDto,
    type Period,
    type TrafficConsumersTableResponseDto,
} from '@hitapi/types';
import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { LoadingRows } from '@/components/states/LoadingState';
import { EditConsumerDialog } from '../dialogs/EditConsumerDialog';
import { useConsumersTableQuery } from '../../hooks';
import { SortIcon } from './SortIcon';
import { getAriaSort, type SortField } from './table.utils';
import { ConsumersEmptyState } from './ConsumersEmptyState';
import { ConsumersTableToolbar } from './ConsumersTableToolbar';
import { ConsumerTableRow } from './ConsumerTableRow';

interface ConsumersTableProps {
    readonly appId: string;
    readonly period?: Period;
    readonly groups?: ConsumerGroupResponseDto[];
    readonly initialGroupId?: string;
}

function useSyncedGroupFilter(initialGroupId?: string) {
    const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>(
        initialGroupId ?? 'all',
    );
    const [prevInitialGroupId, setPrevInitialGroupId] =
        useState(initialGroupId);

    if (initialGroupId !== prevInitialGroupId) {
        setPrevInitialGroupId(initialGroupId);
        if (initialGroupId) {
            setSelectedGroupFilter(initialGroupId);
        }
    }

    return [selectedGroupFilter, setSelectedGroupFilter] as const;
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
    const [selectedGroupFilter, setSelectedGroupFilter] =
        useSyncedGroupFilter(initialGroupId);
    const [onlyNew, setOnlyNew] = useState(false);
    const [sortBy, setSortBy] = useState<SortField>('requests');
    const [order, setOrder] = useState<OrderDirection>(OrderDirection.DESC);

    const consumerGroupId =
        selectedGroupFilter !== 'all' && selectedGroupFilter !== 'unassigned'
            ? Number.parseInt(selectedGroupFilter, 10)
            : undefined;

    const hasActiveFilters =
        selectedGroupFilter !== 'all' || onlyNew || search.trim().length > 0;

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

    const resetFilters = () => {
        setSearch('');
        setSelectedGroupFilter('all');
        setOnlyNew(false);
    };

    return (
        <div className="space-y-4">
            <ConsumersTableToolbar
                search={search}
                onSearchChange={setSearch}
                onlyNew={onlyNew}
                onToggleOnlyNew={() => {
                    setOnlyNew((prev) => !prev);
                }}
                selectedGroupFilter={selectedGroupFilter}
                onGroupFilterChange={setSelectedGroupFilter}
                groups={groups}
                hasActiveFilters={hasActiveFilters}
                onResetFilters={resetFilters}
            />

            {tableQuery.isLoading && consumers.length === 0 && <LoadingRows />}

            {!tableQuery.isLoading && consumers.length === 0 && (
                <ConsumersEmptyState
                    hasActiveFilters={hasActiveFilters}
                    onResetFilters={resetFilters}
                />
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
                                    aria-sort={getAriaSort(
                                        'name',
                                        sortBy,
                                        order,
                                    )}
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
                                    aria-sort={getAriaSort(
                                        'requests',
                                        sortBy,
                                        order,
                                    )}
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
                                    aria-sort={getAriaSort(
                                        'errorRate',
                                        sortBy,
                                        order,
                                    )}
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
                                    aria-sort={getAriaSort(
                                        'lastRequest',
                                        sortBy,
                                        order,
                                    )}
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
                            {consumers.map((consumer) => (
                                <ConsumerTableRow
                                    key={consumer.id}
                                    consumer={consumer}
                                    onEdit={handleEdit}
                                />
                            ))}
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
