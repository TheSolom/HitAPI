import { useMemo, useState } from 'react';
import { Eye, ShieldCheck } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    SearchInput,
    TableLoadingRows,
    TableWrapper,
} from '@/components/common';
import { EmptyState } from '@/components/states/EmptyState';
import { useValidationErrorsTableQuery } from '../../hooks';
import { ValidationErrorDetailDialog } from '../dialogs/ValidationErrorDetailDialog';

interface ValidationErrorsTableProps {
    options: Partial<GetValidationAndServerErrorOptions>;
}

export function ValidationErrorsTable({
    options,
}: Readonly<ValidationErrorsTableProps>) {
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
            return <TableLoadingRows colSpan={5} rows={3} />;
        }
        if (filteredErrors.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="p-6">
                        <EmptyState
                            icon={ShieldCheck}
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
                                '—'
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
                <SearchInput
                    placeholder="Search validation errors or fields..."
                    value={search}
                    onChange={setSearch}
                    className="min-w-48 sm:max-w-xs"
                />
            </div>

            <TableWrapper>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-36 text-xs font-semibold">
                                Error Type
                            </TableHead>
                            <TableHead className="text-xs font-semibold">
                                Error Message
                            </TableHead>
                            <TableHead className="w-48 text-xs font-semibold">
                                Location
                            </TableHead>
                            <TableHead className="w-24 text-right text-xs font-semibold">
                                Count
                            </TableHead>
                            <TableHead className="w-20 text-center text-xs font-semibold">
                                Details
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{renderTableBody()}</TableBody>
                </Table>
            </TableWrapper>

            {selectedError ? (
                <ValidationErrorDetailDialog
                    error={selectedError}
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                />
            ) : null}
        </div>
    );
}
