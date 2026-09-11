import { useMemo, useState } from 'react';
import { Eye, Search, X } from 'lucide-react';
import type {
    GetValidationAndServerErrorOptions,
    ValidationErrorsTableResponseDto,
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
import { useValidationErrorsTableQuery } from '../../hooks';
import { ValidationErrorDetailDialog } from '../dialogs/ValidationErrorDetailDialog';
import { ErrorsEmptyState } from './ErrorsEmptyState';

interface ValidationErrorsTableProps {
    readonly options: Partial<GetValidationAndServerErrorOptions>;
}

export function ValidationErrorsTable({ options }: ValidationErrorsTableProps) {
    const [search, setSearch] = useState('');
    const [selectedError, setSelectedError] =
        useState<ValidationErrorsTableResponseDto | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    const tableQuery = useValidationErrorsTableQuery(options);
    const queryData = tableQuery.data;

    const filteredErrors = useMemo(() => {
        const rawErrors = queryData ?? [];
        if (!search.trim()) return rawErrors;
        const q = search.trim().toLowerCase();
        return rawErrors.filter(
            (err) =>
                err.msg.toLowerCase().includes(q) ||
                err.type.toLowerCase().includes(q) ||
                err.loc.some((l) => l.toLowerCase().includes(q)),
        );
    }, [queryData, search]);

    const handleViewDetails = (error: ValidationErrorsTableResponseDto) => {
        setSelectedError(error);
        setDetailDialogOpen(true);
    };

    const emptyTitle = search
        ? 'No matching validation errors'
        : 'No validation errors recorded';
    const emptyDescription = search
        ? 'Try adjusting your search criteria.'
        : 'No request validation failures (400/422) occurred in this period.';

    const renderTableBody = () => {
        if (tableQuery.isLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="h-32">
                        <LoadingRows rows={3} />
                    </TableCell>
                </TableRow>
            );
        }
        if (filteredErrors.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="h-48">
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
                                className="font-mono text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            >
                                {err.type}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-foreground max-w-sm truncate">
                            <span title={err.msg}>{err.msg}</span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                            {err.loc.length > 0 ? (
                                <span className="flex items-center gap-1">
                                    {err.loc.join(' > ')}
                                </span>
                            ) : (
                                'â€”'
                            )}
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
                                    handleViewDetails(err);
                                }}
                                title="View Details"
                            >
                                <Eye className="h-3.5 w-3.5" />
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
                        placeholder="Search validation errors or fields..."
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
                            <TableHead className="w-36 text-xs font-semibold">
                                Error Type
                            </TableHead>
                            <TableHead className="text-xs font-semibold">
                                Message
                            </TableHead>
                            <TableHead className="text-xs font-semibold">
                                Location
                            </TableHead>
                            <TableHead className="text-right text-xs font-semibold w-24">
                                Count
                            </TableHead>
                            <TableHead className="w-20 text-center text-xs font-semibold">
                                Details
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{renderTableBody()}</TableBody>
                </Table>
            </div>

            <ValidationErrorDetailDialog
                error={selectedError}
                open={detailDialogOpen}
                onOpenChange={(open) => {
                    setDetailDialogOpen(open);
                    if (!open) setSelectedError(null);
                }}
            />
        </div>
    );
}
