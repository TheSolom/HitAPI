import { memo } from 'react';
import type { TrafficEndpointsTableResponseDto } from '@hitapi/types';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { EndpointPath } from '@/components/common';
import { cn } from '@/lib/utils';
import { formatBytes, formatNumber, formatRate } from '../../utils';
import { getMethodBadgeClass } from './table.utils';

export interface TrafficEndpointsTableRowProps {
    endpoint: TrafficEndpointsTableResponseDto;
}

export const TrafficEndpointsTableRow = memo(function TrafficEndpointsTableRow({
    endpoint,
}: Readonly<TrafficEndpointsTableRowProps>) {
    const errorRate = endpoint.errorRate;

    const getErrorRateBadgeClass = (rate: number) => {
        if (rate > 5) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
        if (rate > 0)
            return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
        return 'text-muted-foreground';
    };

    return (
        <TableRow className="hover:bg-muted/50 transition-colors">
            {/* Method */}
            <TableCell className="w-24">
                <Badge
                    variant="outline"
                    className={cn(
                        'font-mono text-[10px] font-semibold tracking-wider px-1.5 py-0.5 border',
                        getMethodBadgeClass(endpoint.method),
                    )}
                >
                    {endpoint.method}
                </Badge>
            </TableCell>

            {/* Path */}
            <TableCell className="max-w-xs md:max-w-md truncate">
                <EndpointPath path={endpoint.path} />
            </TableCell>

            {/* Total Requests */}
            <TableCell className="text-right font-medium tabular-nums text-foreground">
                {formatNumber(endpoint.totalRequestCount)}
            </TableCell>

            {/* Client Errors (4xx) */}
            <TableCell className="text-right tabular-nums text-muted-foreground">
                <span
                    className={
                        endpoint.clientErrorCount > 0
                            ? 'text-amber-500 font-medium'
                            : undefined
                    }
                >
                    {formatNumber(endpoint.clientErrorCount)}
                </span>
            </TableCell>

            {/* Server Errors (5xx) */}
            <TableCell className="text-right tabular-nums text-muted-foreground">
                <span
                    className={
                        endpoint.serverErrorCount > 0
                            ? 'text-rose-500 font-medium'
                            : undefined
                    }
                >
                    {formatNumber(endpoint.serverErrorCount)}
                </span>
            </TableCell>

            {/* Error Rate */}
            <TableCell className="text-right tabular-nums">
                <span
                    className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                        getErrorRateBadgeClass(errorRate),
                    )}
                >
                    {formatRate(errorRate)}
                </span>
            </TableCell>

            {/* Data Transferred */}
            <TableCell className="text-right tabular-nums font-mono text-xs text-muted-foreground">
                {formatBytes(endpoint.dataTransferred)}
            </TableCell>
        </TableRow>
    );
});
