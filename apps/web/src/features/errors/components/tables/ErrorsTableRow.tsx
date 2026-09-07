import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ErrorsTableResponseDto } from '@hitapi/types';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getMethodBadgeClass, getStatusCodeBadgeClass } from './table.utils';

interface ErrorsTableRowProps {
    readonly error: ErrorsTableResponseDto;
}

export function ErrorsTableRow({ error }: ErrorsTableRowProps) {
    return (
        <TableRow className="hover:bg-muted/40 transition-colors">
            {/* Method */}
            <TableCell className="w-24">
                <Badge
                    variant="outline"
                    className={`font-mono text-[11px] font-semibold tracking-wider ${getMethodBadgeClass(error.method)}`}
                >
                    {error.method}
                </Badge>
            </TableCell>

            {/* Path */}
            <TableCell className="font-mono text-xs font-medium text-foreground max-w-xs truncate">
                <span title={error.path}>{error.path}</span>
            </TableCell>

            {/* Status Code & Text */}
            <TableCell>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className={`font-mono text-[11px] font-semibold ${getStatusCodeBadgeClass(error.statusCode)}`}
                    >
                        {error.statusCode}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        {error.statusText}
                    </span>
                </div>
            </TableCell>

            {/* Request Count */}
            <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                {error.requestCount.toLocaleString()}
            </TableCell>

            {/* Affected Consumers */}
            <TableCell className="text-right font-mono text-xs text-muted-foreground">
                {error.affectedConsumers.toLocaleString()}
            </TableCell>

            {/* Expected / Unexpected */}
            <TableCell className="text-center">
                {error.expected ? (
                    <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] gap-1 font-medium"
                    >
                        <CheckCircle2 className="h-3 w-3" />
                        Expected
                    </Badge>
                ) : (
                    <Badge
                        variant="outline"
                        className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] gap-1 font-medium"
                    >
                        <AlertCircle className="h-3 w-3" />
                        Unexpected
                    </Badge>
                )}
            </TableCell>
        </TableRow>
    );
}
