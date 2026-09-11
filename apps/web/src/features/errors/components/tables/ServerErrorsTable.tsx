import { useMemo, useState } from 'react';
import { Search, Terminal, X } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingRows } from '@/components/states/LoadingState';
import { useServerErrorsTableQuery } from '../../hooks';
import { ServerErrorTracebackDialog } from '../dialogs/ServerErrorTracebackDialog';
import { ErrorsEmptyState } from './ErrorsEmptyState';

interface ServerErrorsTableProps {
    readonly options: Partial<GetValidationAndServerErrorOptions>;
}

export function ServerErrorsTable({ options }: ServerErrorsTableProps) {
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
            return (
                <TableRow>
                    <TableCell colSpan={4} className="h-32">
                        <LoadingRows rows={3} />
                    </TableCell>
                </TableRow>
            );
        }
        if (filteredErrors.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={4} className="h-48">
                        <ErrorsEmptyState
                            title={emptyTitle}
                            description={emptyDescription}
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
                                className="font-mono text-[11px] bg-destructive/10 text-destructive border-destructive/20"
                            >
                                {err.type}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-foreground max-w-md truncate">
                            <span title={err.msg}>{err.msg}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold text-destructive">
                            {err.errorCount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1.5 font-mono"
                                onClick={() => {
                                    handleViewTraceback(err);
                                }}
                            >
                                <Terminal className="h-3 w-3" />
                                <span>Trace</span>
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
                <div className="relative flex-1 min-w-48 sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search server exceptions or messages..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                        className="pl-8.5 h-9 text-xs"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                            }}
                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-48 text-xs font-semibold">
                                Exception Type
                            </TableHead>
                            <TableHead className="text-xs font-semibold">
                                Error Message
                            </TableHead>
                            <TableHead className="text-right text-xs font-semibold w-24">
                                Crashes
                            </TableHead>
                            <TableHead className="w-32 text-center text-xs font-semibold">
                                Traceback
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{renderTableBody()}</TableBody>
                </Table>
            </div>

            <ServerErrorTracebackDialog
                error={selectedError}
                open={tracebackDialogOpen}
                onOpenChange={(open) => {
                    setTracebackDialogOpen(open);
                    if (!open) setSelectedError(null);
                }}
            />
        </div>
    );
}
