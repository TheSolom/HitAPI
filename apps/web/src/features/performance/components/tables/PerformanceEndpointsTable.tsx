import { useMemo, useState } from 'react';
import { Network } from 'lucide-react';
import { OrderDirection, type GetPerformanceOptions } from '@hitapi/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { SortIcon, TableLoadingRows } from '@/components/common';
import { EmptyState } from '@/components/states/EmptyState';
import { usePagination, useSortState } from '@/hooks';
import { usePerformanceEndpointsTableQuery } from '../../hooks';
import {
    sortPerformanceEndpoints,
    type PerformanceSortField,
} from './table.utils';
import { PerformanceEndpointsTableToolbar } from './PerformanceEndpointsTableToolbar';
import { PerformanceEndpointsTableRow } from './PerformanceEndpointsTableRow';

export interface PerformanceEndpointsTableProps {
    options: Partial<GetPerformanceOptions>;
}

export function PerformanceEndpointsTable({
    options,
}: Readonly<PerformanceEndpointsTableProps>) {
    const { data: rawEndpoints = [], isLoading } =
        usePerformanceEndpointsTableQuery(options);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<string>('all');
    const {
        sortBy,
        order,
        handleSort: onSort,
    } = useSortState<PerformanceSortField>(
        'totalRequestCount',
        OrderDirection.DESC,
    );

    const filteredEndpoints = useMemo(() => {
        return rawEndpoints.filter((ep) => {
            const matchesSearch =
                searchTerm === '' ||
                ep.path.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesMethod =
                selectedMethod === 'all' ||
                (ep.method as string) === selectedMethod;
            return matchesSearch && matchesMethod;
        });
    }, [rawEndpoints, searchTerm, selectedMethod]);

    const sortedEndpoints = useMemo(() => {
        return sortPerformanceEndpoints(filteredEndpoints, sortBy, order);
    }, [filteredEndpoints, sortBy, order]);

    const {
        currentPage,
        totalPages,
        pageSize,
        paginatedItems: paginatedEndpoints,
        goToNextPage,
        goToPrevPage,
        hasNextPage,
        hasPrevPage,
        resetPage,
    } = usePagination(sortedEndpoints, 15);

    const handleSort = (field: PerformanceSortField) => {
        onSort(field);
        resetPage();
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedMethod('all');
        resetPage();
    };

    const isFiltered = searchTerm !== '' || selectedMethod !== 'all';

    return (
        <Card className="overflow-hidden">
            <PerformanceEndpointsTableToolbar
                searchTerm={searchTerm}
                onSearchChange={(val) => {
                    setSearchTerm(val);
                    resetPage();
                }}
                selectedMethod={selectedMethod}
                onMethodChange={(val) => {
                    setSelectedMethod(val);
                    resetPage();
                }}
                totalCount={rawEndpoints.length}
                filteredCount={filteredEndpoints.length}
                onResetFilters={resetFilters}
            />

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead className="w-24 text-xs font-semibold">
                                Method
                            </TableHead>
                            <TableHead>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSort('path');
                                    }}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground group"
                                >
                                    <span>Endpoint Path</span>
                                    <SortIcon
                                        column="path"
                                        sortBy={sortBy}
                                        order={order}
                                    />
                                </button>
                            </TableHead>
                            <TableHead className="text-right">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSort('totalRequestCount');
                                    }}
                                    className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground group"
                                >
                                    <span>Requests</span>
                                    <SortIcon
                                        column="totalRequestCount"
                                        sortBy={sortBy}
                                        order={order}
                                    />
                                </button>
                            </TableHead>
                            <TableHead className="text-right">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSort('responseTimeP50');
                                    }}
                                    className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground group"
                                >
                                    <span>P50</span>
                                    <SortIcon
                                        column="responseTimeP50"
                                        sortBy={sortBy}
                                        order={order}
                                    />
                                </button>
                            </TableHead>
                            <TableHead className="text-right">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSort('responseTimeP75');
                                    }}
                                    className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground group"
                                >
                                    <span>P75</span>
                                    <SortIcon
                                        column="responseTimeP75"
                                        sortBy={sortBy}
                                        order={order}
                                    />
                                </button>
                            </TableHead>
                            <TableHead className="text-right">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSort('responseTimeP95');
                                    }}
                                    className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground group"
                                >
                                    <span>P95</span>
                                    <SortIcon
                                        column="responseTimeP95"
                                        sortBy={sortBy}
                                        order={order}
                                    />
                                </button>
                            </TableHead>
                            <TableHead className="text-right">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSort('apdexScore');
                                    }}
                                    className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground group"
                                >
                                    <span>Apdex</span>
                                    <SortIcon
                                        column="apdexScore"
                                        sortBy={sortBy}
                                        order={order}
                                    />
                                </button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading && (
                            <TableLoadingRows
                                colSpan={7}
                                rows={5}
                                className="p-8"
                            />
                        )}
                        {!isLoading &&
                            paginatedEndpoints.length > 0 &&
                            paginatedEndpoints.map((endpoint) => (
                                <PerformanceEndpointsTableRow
                                    key={endpoint.id}
                                    endpoint={endpoint}
                                />
                            ))}
                        {!isLoading && paginatedEndpoints.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="p-6">
                                    <EmptyState
                                        icon={Network}
                                        title={
                                            isFiltered
                                                ? 'No matching endpoints'
                                                : 'No endpoint performance data'
                                        }
                                        description={
                                            isFiltered
                                                ? 'No endpoints match your current filter criteria. Try clearing your search or method filters.'
                                                : 'Endpoint latency percentiles and Apdex scores will appear as API requests are processed.'
                                        }
                                        isFiltered={isFiltered}
                                        onResetFilters={resetFilters}
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {sortedEndpoints.length > pageSize && (
                <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
                    <div>
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!hasPrevPage}
                            onClick={goToPrevPage}
                            className="h-7 text-xs"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!hasNextPage}
                            onClick={goToNextPage}
                            className="h-7 text-xs"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
