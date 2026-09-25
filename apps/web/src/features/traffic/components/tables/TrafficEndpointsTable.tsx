import { useMemo, useState } from 'react';
import { Network } from 'lucide-react';
import { type GetTrafficOptions } from '@hitapi/types';
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
import { useTrafficEndpointsTableQuery } from '../../hooks';
import { sortTrafficEndpoints, type TrafficSortField } from './table.utils';
import { TrafficEndpointsTableRow } from './TrafficEndpointsTableRow';

export interface TrafficEndpointsTableProps {
    options: Partial<GetTrafficOptions>;
}

export function TrafficEndpointsTable({
    options,
}: Readonly<TrafficEndpointsTableProps>) {
    const { data: rawEndpoints = [], isLoading } =
        useTrafficEndpointsTableQuery(options);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('all');

    const { sortBy, order, handleSort } =
        useSortState<TrafficSortField>('totalRequestCount');

    // 1. Filter by search term and method
    const filteredEndpoints = useMemo(() => {
        return rawEndpoints.filter((endpoint) => {
            const matchesSearch =
                searchTerm === '' ||
                endpoint.path.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesMethod =
                selectedMethod === 'all' ||
                endpoint.method.toLowerCase() === selectedMethod.toLowerCase();
            return matchesSearch && matchesMethod;
        });
    }, [rawEndpoints, searchTerm, selectedMethod]);

    // 2. Sort
    const sortedEndpoints = useMemo(() => {
        return sortTrafficEndpoints(filteredEndpoints, sortBy, order);
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

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedMethod('all');
        resetPage();
    };

    const isFiltered = searchTerm !== '' || selectedMethod !== 'all';

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
                                        handleSort('clientErrorCount');
                                    }}
                                    className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground group"
                                >
                                    <span>4xx Errors</span>
                                    <SortIcon
                                        column="clientErrorCount"
                                        sortBy={sortBy}
                                        order={order}
                                    />
                                </button>
                            </TableHead>
                            <TableHead className="text-right">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSort('serverErrorCount');
                                    }}
                                    className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground group"
                                >
                                    <span>5xx Errors</span>
                                    <SortIcon
                                        column="serverErrorCount"
                                        sortBy={sortBy}
                                        order={order}
                                    />
                                </button>
                            </TableHead>
                            <TableHead className="text-right">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSort('errorRate');
                                    }}
                                    className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground group"
                                >
                                    <span>Error Rate</span>
                                    <SortIcon
                                        column="errorRate"
                                        sortBy={sortBy}
                                        order={order}
                                    />
                                </button>
                            </TableHead>
                            <TableHead className="text-right">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSort('dataTransferred');
                                    }}
                                    className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground group"
                                >
                                    <span>Data</span>
                                    <SortIcon
                                        column="dataTransferred"
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
                                <TrafficEndpointsTableRow
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
                                                : 'No endpoint traffic data'
                                        }
                                        description={
                                            isFiltered
                                                ? 'No endpoints match your current filter criteria. Try clearing your search or method filters.'
                                                : 'Endpoint traffic and error metrics will appear as API requests are processed.'
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
