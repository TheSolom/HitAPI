import { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { OrderDirection, type GetErrorOptions } from '@hitapi/types';
import { RestfulMethod } from '@hitapi/shared/enums';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { SortIcon, TableLoadingRows, TableWrapper } from '@/components/common';
import { EmptyState } from '@/components/states/EmptyState';
import { getAriaSort } from '@/lib/sort';
import { useSortState } from '@/hooks';
import { useErrorsTableQuery } from '../../hooks';
import { ErrorsTableToolbar } from './ErrorsTableToolbar';
import { ErrorsTableRow } from './ErrorsTableRow';
export type ErrorSortField =
    'statusCode' | 'requestCount' | 'affectedConsumers' | 'path';

interface ErrorsTableProps {
    options: Partial<GetErrorOptions>;
}

export function ErrorsTable({ options }: Readonly<ErrorsTableProps>) {
    const [search, setSearch] = useState('');
    const [methodFilter, setMethodFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const { sortBy, order, handleSort } = useSortState<ErrorSortField>(
        'requestCount',
        OrderDirection.DESC,
    );

    const effectiveMethod =
        methodFilter !== 'all'
            ? (methodFilter as RestfulMethod)
            : options.method;

    const effectiveStatusCode =
        statusFilter !== 'all' &&
        statusFilter !== '4xx' &&
        statusFilter !== '5xx'
            ? statusFilter
            : options.statusCode;

    const tableQuery = useErrorsTableQuery({
        ...options,
        method: effectiveMethod,
        statusCode: effectiveStatusCode,
    });

    const queryData = tableQuery.data;

    const filteredAndSortedErrors = useMemo(() => {
        const rawErrors = queryData ?? [];
        let result = [...rawErrors];

        // Search by path
        if (search.trim()) {
            const query = search.trim().toLowerCase();
            result = result.filter(
                (e) =>
                    e.path.toLowerCase().includes(query) ||
                    e.statusText.toLowerCase().includes(query),
            );
        }

        // 4xx / 5xx grouping filter
        if (statusFilter === '4xx') {
            result = result.filter(
                (e) => e.statusCode >= 400 && e.statusCode < 500,
            );
        } else if (statusFilter === '5xx') {
            result = result.filter((e) => e.statusCode >= 500);
        }

        // Client-side sorting
        result.sort((a, b) => {
            let comparison: number;
            switch (sortBy) {
                case 'statusCode':
                    comparison = a.statusCode - b.statusCode;
                    break;
                case 'requestCount':
                    comparison = a.requestCount - b.requestCount;
                    break;
                case 'affectedConsumers':
                    comparison = a.affectedConsumers - b.affectedConsumers;
                    break;
                case 'path':
                default:
                    comparison = a.path.localeCompare(b.path);
                    break;
            }
            return order === OrderDirection.ASC ? comparison : -comparison;
        });

        return result;
    }, [queryData, search, statusFilter, sortBy, order]);

    const hasActiveFilters =
        Boolean(search.trim()) ||
        methodFilter !== 'all' ||
        statusFilter !== 'all';

    const handleResetFilters = () => {
        setSearch('');
        setMethodFilter('all');
        setStatusFilter('all');
    };

    const emptyTitle = hasActiveFilters
        ? 'No matching errors'
        : 'No HTTP errors found';
    const emptyDescription = hasActiveFilters
        ? 'Try clearing search filters or changing status codes.'
        : 'Zero 4xx/5xx responses were captured for this application in the selected period.';

    const renderTableBody = () => {
        if (tableQuery.isLoading) {
            return <TableLoadingRows colSpan={6} rows={3} />;
        }
        if (filteredAndSortedErrors.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={6} className="p-6">
                        <EmptyState
                            icon={ShieldCheck}
                            title={emptyTitle}
                            description={emptyDescription}
                            isFiltered={hasActiveFilters}
                            onResetFilters={handleResetFilters}
                        />
                    </TableCell>
                </TableRow>
            );
        }
        return (
            <>
                {filteredAndSortedErrors.map((error) => (
                    <ErrorsTableRow key={error.id} error={error} />
                ))}
            </>
        );
    };

    return (
        <div className="space-y-4">
            <ErrorsTableToolbar
                search={search}
                onSearchChange={setSearch}
                methodFilter={methodFilter}
                onMethodFilterChange={setMethodFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onResetFilters={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
            />

            <TableWrapper>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-24 text-xs font-semibold">
                                Method
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none text-xs font-semibold"
                                onClick={() => {
                                    handleSort('path');
                                }}
                                aria-sort={getAriaSort('path', sortBy, order)}
                            >
                                <div className="flex items-center gap-1.5 group">
                                    <span>Path</span>
                                    <SortIcon
                                        column="path"
                                        sortBy={sortBy}
                                        order={order}
                                    />
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none text-xs font-semibold"
                                onClick={() => {
                                    handleSort('statusCode');
                                }}
                                aria-sort={getAriaSort(
                                    'statusCode',
                                    sortBy,
                                    order,
                                )}
                            >
                                <div className="flex items-center gap-1.5 group">
                                    <span>Status</span>
                                    <SortIcon
                                        column="statusCode"
                                        sortBy={sortBy}
                                        order={order}
                                    />
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none text-right text-xs font-semibold"
                                onClick={() => {
                                    handleSort('requestCount');
                                }}
                                aria-sort={getAriaSort(
                                    'requestCount',
                                    sortBy,
                                    order,
                                )}
                            >
                                <div className="flex items-center justify-end gap-1.5 group">
                                    <span>Errors</span>
                                    <SortIcon
                                        column="requestCount"
                                        sortBy={sortBy}
                                        order={order}
                                    />
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none text-right text-xs font-semibold"
                                onClick={() => {
                                    handleSort('affectedConsumers');
                                }}
                                aria-sort={getAriaSort(
                                    'affectedConsumers',
                                    sortBy,
                                    order,
                                )}
                            >
                                <div className="flex items-center justify-end gap-1.5 group">
                                    <span>Consumers</span>
                                    <SortIcon
                                        column="affectedConsumers"
                                        sortBy={sortBy}
                                        order={order}
                                    />
                                </div>
                            </TableHead>
                            <TableHead className="w-28 text-center text-xs font-semibold">
                                Config
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{renderTableBody()}</TableBody>
                </Table>
            </TableWrapper>
        </div>
    );
}
