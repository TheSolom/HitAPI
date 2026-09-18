import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { GetTrafficOptions } from '@hitapi/types';
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
import { LoadingRows } from '@/components/states/LoadingState';
import { useTrafficEndpointsTableQuery } from '../../hooks';
import {
    sortTrafficEndpoints,
    type TrafficSortDirection,
    type TrafficSortField,
} from './table.utils';
import { TrafficEndpointsTableToolbar } from './TrafficEndpointsTableToolbar';
import { TrafficEndpointsTableRow } from './TrafficEndpointsTableRow';
import { TrafficEndpointsEmptyState } from './TrafficEndpointsEmptyState';

export interface TrafficEndpointsTableProps {
    options: Partial<GetTrafficOptions>;
}

export function TrafficEndpointsTable({
    options,
}: Readonly<TrafficEndpointsTableProps>) {
    const { data: rawEndpoints = [], isLoading } =
        useTrafficEndpointsTableQuery(options);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<string>('all');
    const [sortBy, setSortBy] = useState<TrafficSortField>('totalRequestCount');
    const [sortDirection, setSortDirection] =
        useState<TrafficSortDirection>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    const handleSort = (field: TrafficSortField) => {
        if (sortBy === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortDirection('desc');
        }
        setCurrentPage(1);
    };

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
        return sortTrafficEndpoints(filteredEndpoints, sortBy, sortDirection);
    }, [filteredEndpoints, sortBy, sortDirection]);

    const totalPages = Math.max(
        1,
        Math.ceil(sortedEndpoints.length / pageSize),
    );
    const paginatedEndpoints = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedEndpoints.slice(start, start + pageSize);
    }, [sortedEndpoints, currentPage, pageSize]);

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedMethod('all');
        setCurrentPage(1);
    };

    const renderSortIcon = (field: TrafficSortField) => {
        if (sortBy !== field) {
            return (
                <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/40" />
            );
        }
        return sortDirection === 'asc' ? (
            <ArrowUp className="ml-1 h-3 w-3 text-foreground" />
        ) : (
            <ArrowDown className="ml-1 h-3 w-3 text-foreground" />
        );
    };

    return (
        <Card className="overflow-hidden">
            <TrafficEndpointsTableToolbar
                searchTerm={searchTerm}
                onSearchChange={(val) => {
                    setSearchTerm(val);
                    setCurrentPage(1);
                }}
                selectedMethod={selectedMethod}
                onMethodChange={(val) => {
                    setSelectedMethod(val);
                    setCurrentPage(1);
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
                                    className="flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground"
                                >
                                    Endpoint Path {renderSortIcon('path')}
                                </button>
                            </TableHead>
                            <TableHead className="text-right">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSort('totalRequestCount');
                                    }}
                                    className="ml-auto flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground"
                                >
                                    Requests{' '}
                                    {renderSortIcon('totalRequestCount')}
                                </button>
                            </TableHead>
                            <TableHead className="text-right">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSort('clientErrorCount');
                                    }}
                                    className="ml-auto flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground"
                                >
                                    4xx Errors{' '}
                                    {renderSortIcon('clientErrorCount')}
                                </button>
                            </TableHead>
                            <TableHead className="text-right">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSort('serverErrorCount');
                                    }}
                                    className="ml-auto flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground"
                                >
                                    5xx Errors{' '}
                                    {renderSortIcon('serverErrorCount')}
                                </button>
                            </TableHead>
                            <TableHead className="text-right">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSort('errorRate');
                                    }}
                                    className="ml-auto flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground"
                                >
                                    Error Rate {renderSortIcon('errorRate')}
                                </button>
                            </TableHead>
                            <TableHead className="text-right">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSort('dataTransferred');
                                    }}
                                    className="ml-auto flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground"
                                >
                                    Data {renderSortIcon('dataTransferred')}
                                </button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={7} className="p-8">
                                    <LoadingRows rows={5} />
                                </TableCell>
                            </TableRow>
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
                                <TableCell colSpan={7} className="p-0">
                                    <TrafficEndpointsEmptyState
                                        isFiltered={
                                            searchTerm !== '' ||
                                            selectedMethod !== 'all'
                                        }
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
                            disabled={currentPage <= 1}
                            onClick={() => {
                                setCurrentPage((p) => Math.max(1, p - 1));
                            }}
                            className="h-7 text-xs"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= totalPages}
                            onClick={() => {
                                setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1),
                                );
                            }}
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
