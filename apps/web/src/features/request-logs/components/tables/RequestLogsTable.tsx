import { useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import {
    OrderDirection,
    type GetRequestLogsOptions,
    type Period,
    type RequestLogResponseDto,
} from '@hitapi/types';
import type { RestfulMethod } from '@hitapi/shared/enums';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TableLoadingRows, TableWrapper } from '@/components/common';
import { EmptyState } from '@/components/states/EmptyState';
import { useCursorPagination } from '@/hooks';
import { useExportRequestLogs, useRequestLogsQuery } from '../../hooks';
import { RequestLogsTableToolbar } from './RequestLogsTableToolbar';
import { RequestLogsTableRow } from './RequestLogsTableRow';
import { RequestLogDetailsDialog } from '../dialogs/RequestLogDetailsDialog';

export interface RequestLogsTableProps {
    appId: string;
    period?: Period;
    consumerId?: number;
    consumerGroupId?: number;
    initialMethod?: string;
    initialPath?: string;
    initialStatusCode?: string;
}

export function RequestLogsTable({
    appId,
    period,
    consumerId,
    consumerGroupId,
    initialMethod,
    initialPath,
    initialStatusCode,
}: Readonly<RequestLogsTableProps>) {
    const [search, setSearch] = useState(initialPath ?? '');
    const [selectedMethod, setSelectedMethod] = useState<string>(
        initialMethod ?? 'all',
    );
    const [selectedStatusCode, setSelectedStatusCode] = useState<string>(
        initialStatusCode ?? 'all',
    );
    const [order, setOrder] = useState<OrderDirection>(OrderDirection.DESC);
    const pageSize = 20;

    const [selectedLog, setSelectedLog] =
        useState<RequestLogResponseDto | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const {
        cursor,
        currentPage,
        hasPrevPage,
        goToNextPage,
        goToPrevPage,
        resetPagination,
    } = useCursorPagination();

    // Build API query parameters
    const queryOptions = useMemo<Partial<GetRequestLogsOptions>>(() => {
        const options: Partial<GetRequestLogsOptions> = {
            appId,
            period,
            consumerId,
            consumerGroupId,
            order,
            limit: pageSize,
        };

        if (search.trim()) {
            options.path = search.trim();
        }

        if (selectedMethod !== 'all') {
            options.method = selectedMethod as RestfulMethod;
        }

        if (selectedStatusCode !== 'all') {
            if (selectedStatusCode.endsWith('xx')) {
                const prefix = Number.parseInt(selectedStatusCode[0], 10);
                if (!Number.isNaN(prefix)) {
                    options.statusCode = prefix * 100;
                }
            } else {
                const codeNum = Number.parseInt(selectedStatusCode, 10);
                if (!Number.isNaN(codeNum)) {
                    options.statusCode = codeNum;
                }
            }
        }

        return options;
    }, [
        appId,
        period,
        consumerId,
        consumerGroupId,
        order,
        search,
        selectedMethod,
        selectedStatusCode,
    ]);

    // Single active query bound to cursor and page
    const logsQuery = useRequestLogsQuery({
        ...queryOptions,
        cursor: cursor ?? undefined,
        offset: currentPage,
        limit: pageSize,
    });

    const totalPages = logsQuery.data ? logsQuery.data.metadata.totalPages : 1;
    const totalItems = logsQuery.data ? logsQuery.data.metadata.totalItems : 0;
    const logs = logsQuery.data?.data ?? [];
    const nextCursor = logsQuery.data?.metadata.nextCursor ?? null;

    const hasNextPage =
        logsQuery.data?.metadata.hasNextPage ?? currentPage < totalPages;

    const { exportCsv, isExporting } = useExportRequestLogs();

    const handleExport = () => {
        if (!appId) return;
        void exportCsv({
            ...queryOptions,
            appId,
        });
    };

    const hasActiveFilters = Boolean(
        search.trim() ||
        selectedMethod !== 'all' ||
        selectedStatusCode !== 'all',
    );

    const handleResetFilters = () => {
        setSearch('');
        setSelectedMethod('all');
        setSelectedStatusCode('all');
        resetPagination();
    };

    const handleViewDetails = (log: RequestLogResponseDto) => {
        setSelectedLog(log);
        setDetailsOpen(true);
    };

    const fromItem = logs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const toItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <Card className="shadow-sm">
            <CardContent className="p-6 space-y-4">
                <RequestLogsTableToolbar
                    search={search}
                    onSearchChange={(val) => {
                        setSearch(val);
                        resetPagination();
                    }}
                    method={selectedMethod}
                    onMethodChange={(val) => {
                        setSelectedMethod(val);
                        resetPagination();
                    }}
                    statusCode={selectedStatusCode}
                    onStatusCodeChange={(val) => {
                        setSelectedStatusCode(val);
                        resetPagination();
                    }}
                    order={order}
                    onOrderToggle={() => {
                        setOrder((prev) =>
                            prev === OrderDirection.DESC
                                ? OrderDirection.ASC
                                : OrderDirection.DESC,
                        );
                        resetPagination();
                    }}
                    onExportCsv={handleExport}
                    isExporting={isExporting}
                    hasActiveFilters={hasActiveFilters}
                    onResetFilters={handleResetFilters}
                />

                {logsQuery.isLoading && logs.length === 0 && (
                    <TableLoadingRows colSpan={9} />
                )}

                {!logsQuery.isLoading && logs.length === 0 && (
                    <EmptyState
                        icon={FileText}
                        title="No request logs found"
                        description={
                            hasActiveFilters
                                ? 'No request logs match your active filter criteria. Try clearing or relaxing filters.'
                                : 'No HTTP request logs have been ingested for this application in the selected period.'
                        }
                        isFiltered={hasActiveFilters}
                        onResetFilters={handleResetFilters}
                    />
                )}

                {logs.length > 0 && (
                    <div className="space-y-4">
                        <TableWrapper>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 text-xs">
                                        <TableHead className="w-24 pl-4">
                                            Status
                                        </TableHead>
                                        <TableHead className="w-20">
                                            Method
                                        </TableHead>
                                        <TableHead className="min-w-45">
                                            Path
                                        </TableHead>
                                        <TableHead className="w-24">
                                            Latency
                                        </TableHead>
                                        <TableHead className="w-32">
                                            Consumer
                                        </TableHead>
                                        <TableHead className="w-36">
                                            Client IP
                                        </TableHead>
                                        <TableHead className="w-24">
                                            Payload
                                        </TableHead>
                                        <TableHead className="w-32">
                                            Time
                                        </TableHead>
                                        <TableHead className="w-12 pr-4 text-right">
                                            <span className="sr-only">
                                                Actions
                                            </span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <RequestLogsTableRow
                                            key={log.requestUuid}
                                            log={log}
                                            onViewDetails={handleViewDetails}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </TableWrapper>

                        {/* Pagination footer */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t pt-3">
                            <span className="text-xs text-muted-foreground">
                                Showing{' '}
                                <strong className="font-medium text-foreground">
                                    {fromItem}
                                </strong>{' '}
                                to{' '}
                                <strong className="font-medium text-foreground">
                                    {toItem}
                                </strong>{' '}
                                of{' '}
                                <strong className="font-medium text-foreground">
                                    {totalItems}
                                </strong>{' '}
                                request logs
                            </span>

                            <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            !hasPrevPage || logsQuery.isFetching
                                        }
                                        onClick={goToPrevPage}
                                        className="h-8 px-3 text-xs"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            !hasNextPage || logsQuery.isFetching
                                        }
                                        onClick={() => {
                                            goToNextPage(nextCursor);
                                        }}
                                        className="h-8 px-3 text-xs"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Details Dialog */}
                <RequestLogDetailsDialog
                    open={detailsOpen}
                    onOpenChange={setDetailsOpen}
                    log={selectedLog}
                    appId={appId}
                />
            </CardContent>
        </Card>
    );
}
