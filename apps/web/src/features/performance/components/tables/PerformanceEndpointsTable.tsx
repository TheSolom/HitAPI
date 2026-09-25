import { useMemo, useState } from 'react';
import { Network } from 'lucide-react';
import { type GetPerformanceOptions } from '@hitapi/types';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    EndpointsTableToolbar,
    SortIcon,
    TableLoadingRows,
    TablePagination,
} from '@/components/common';
import { EmptyState } from '@/components/states/EmptyState';
import { usePagination, useSortState } from '@/hooks';
import { usePerformanceEndpointsTableQuery } from '../../hooks';
import {
    sortPerformanceEndpoints,
    type PerformanceSortField,
} from './table.utils';
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
    const [selectedMethod, setSelectedMethod] = useState('ALL');

    const { sortBy, order, handleSort } =
        useSortState<PerformanceSortField>('totalRequestCount');

    // 1. Filter by search term and method
    const filteredEndpoints = useMemo(() => {
        return rawEndpoints.filter((endpoint) => {
            const matchesSearch =
                searchTerm === '' ||
                endpoint.path.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesMethod =
                selectedMethod === 'ALL' ||
                endpoint.method.toUpperCase() === selectedMethod.toUpperCase();
            return matchesSearch && matchesMethod;
        });
    }, [rawEndpoints, searchTerm, selectedMethod]);

    // 2. Sort
    const sortedEndpoints = useMemo(() => {
        return sortPerformanceEndpoints(filteredEndpoints, sortBy, order);
    }, [filteredEndpoints, sortBy, order]);

    // 3. Paginate
    const {
        paginatedItems: paginatedEndpoints,
        currentPage,
        totalPages,
        hasPrevPage,
        hasNextPage,
        goToPrevPage,
        goToNextPage,
        resetPage,
        pageSize,
    } = usePagination(sortedEndpoints, 15);

    const isFiltered = searchTerm !== '' || selectedMethod !== 'ALL';

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedMethod('ALL');
        resetPage();
    };

    return (
        <Card className="overflow-hidden">
            <EndpointsTableToolbar
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
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    hasPrevPage={hasPrevPage}
                    hasNextPage={hasNextPage}
                    goToPrevPage={goToPrevPage}
                    goToNextPage={goToNextPage}
                />
            )}
        </Card>
    );
}
