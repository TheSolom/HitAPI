import { useState } from 'react';
import { User } from 'lucide-react';
import {
    OrderDirection,
    type ConsumerGroupResponseDto,
    type Period,
    type TrafficConsumersTableResponseDto,
} from '@hitapi/types';
import { cn } from '@/lib/utils';
import { getAriaSort } from '@/lib/sort';
import { useSortState } from '@/hooks';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { LoadingRows } from '@/components/states/LoadingState';
import { EmptyState } from '@/components/states/EmptyState';
import { SortIcon, TableWrapper } from '@/components/common';
import { EditConsumerDialog } from '../dialogs/EditConsumerDialog';
import { useConsumersTableQuery } from '../../hooks';
import type { SortField } from './table.utils';
import { ConsumersTableToolbar } from './ConsumersTableToolbar';
import { ConsumerTableRow } from './ConsumerTableRow';

interface ConsumersTableProps {
    appId: string;
    period?: Period;
    groups?: ConsumerGroupResponseDto[];
    initialGroupId?: string;
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
}: Readonly<ConsumersTableProps>) {
    const [selectedConsumer, setSelectedConsumer] =
        useState<TrafficConsumersTableResponseDto | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedGroupFilter, setSelectedGroupFilter] =
        useSyncedGroupFilter(initialGroupId);
    const [onlyNew, setOnlyNew] = useState(false);
    const { sortBy, order, handleSort } = useSortState<SortField>(
        'requests',
        OrderDirection.DESC,
    );

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
                <EmptyState
                    icon={User}
                    title="No consumers found"
                    description={
                        hasActiveFilters
                            ? 'No consumers match your active filters. Try adjusting your search query, group filter, or new client toggle.'
                            : 'No consumers reported traffic in this period yet.'
                    }
                    isFiltered={hasActiveFilters}
                    onResetFilters={resetFilters}
                />
            )}

            {consumers.length > 0 && (
                <TableWrapper>
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
                </TableWrapper>
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
