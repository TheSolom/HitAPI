import { useMemo, useState } from 'react';
import { Terminal } from 'lucide-react';
import type {
    GetValidationAndServerErrorOptions,
    ServerErrorsTableResponseDto,
} from '@hitapi/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    SearchInput,
    TableLoadingRows,
    TableWrapper,
} from '@/components/common';
import { EmptyState } from '@/components/states/EmptyState';
import { useServerErrorsTableQuery } from '../../hooks';
import { ServerErrorTracebackDialog } from '../dialogs/ServerErrorTracebackDialog';

interface ServerErrorsTableProps {
    options: Partial<GetValidationAndServerErrorOptions>;
}

export function ServerErrorsTable({
    options,
}: Readonly<ServerErrorsTableProps>) {
    const [search, setSearch] = useState('');
    const [selectedError, setSelectedError] =
        useState<ServerErrorsTableResponseDto | null>(null);
    const [tracebackDialogOpen, setTracebackDialogOpen] = useState(false);

    const tableQuery = useServerErrorsTableQuery(options);
    const queryData = tableQuery.data;

    const filteredErrors = useMemo(() => {
        const rawErrors = queryData ?? [];
        if (!search.trim()) return rawErrors;
        const q = search.trim().toLowerCase();
        return rawErrors.filter(
            (err) =>
                err.msg.toLowerCase().includes(q) ||
                err.type.toLowerCase().includes(q) ||
                err.traceback.toLowerCase().includes(q),
        );
    }, [queryData, search]);

    const handleViewTraceback = (error: ServerErrorsTableResponseDto) => {
        setSelectedError(error);
        setTracebackDialogOpen(true);
    };

    const emptyTitle = search
        ? 'No matching server exceptions'
        : 'Zero server crashes recorded';
    const emptyDescription = search
        ? 'Try adjusting your search query.'
        : 'No unhandled exceptions or 500 server crashes occurred during this period.';

    const renderTableBody = () => {
        if (tableQuery.isLoading) {
            return <TableLoadingRows colSpan={4} rows={3} />;
        }
        if (filteredErrors.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={4} className="p-6">
                        <EmptyState
                            icon={Terminal}
                            title={emptyTitle}
                            description={emptyDescription}
                            isFiltered={Boolean(search)}
                            onResetFilters={() => {
                                setSearch('');
                            }}
                        />
                    </TableCell>
                </TableRow>
            );
        }
        return (
            <>
                {filteredErrors.map((err, idx) => (
                    <TableRow
                        key={`${err.type}-${err.msg}-${String(idx)}`}
                        className="hover:bg-muted/40 transition-colors"
                    >
                        <TableCell>
                            <Badge
                                variant="outline"
                                className="font-mono text-[11px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            >
                                {err.type}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-foreground max-w-sm truncate">
                            <span title={err.msg}>{err.msg}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                            {err.errorCount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => {
                                    handleViewTraceback(err);
                                }}
                                title="View Traceback"
                            >
                                <Terminal className="h-3.5 w-3.5" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <SearchInput
                    placeholder="Search exceptions or stack traces..."
                    value={search}
                    onChange={setSearch}
                    className="min-w-48 sm:max-w-xs"
                />
            </div>

            <TableWrapper>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-48 text-xs font-semibold">
                                Exception Type
                            </TableHead>
                            <TableHead className="text-xs font-semibold">
                                Error Message
                            </TableHead>
                            <TableHead className="w-24 text-right text-xs font-semibold">
                                Crashes
                            </TableHead>
                            <TableHead className="w-20 text-center text-xs font-semibold">
                                Traceback
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{renderTableBody()}</TableBody>
                </Table>
            </TableWrapper>

            {selectedError ? (
                <ServerErrorTracebackDialog
                    error={selectedError}
                    open={tracebackDialogOpen}
                    onOpenChange={setTracebackDialogOpen}
                />
            ) : null}
        </div>
    );
}
