import { memo } from 'react';
import type { TrafficEndpointsTableResponseDto } from '@hitapi/types';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { EndpointPath, MethodBadge } from '@/components/common';
import { cn } from '@/lib/utils';
import { formatBytes, formatNumber, formatRate } from '../../utils';
import { getErrorRateBadgeClass } from './table.utils';

export interface TrafficEndpointsTableRowProps {
    endpoint: TrafficEndpointsTableResponseDto;
}

export const TrafficEndpointsTableRow = memo(function TrafficEndpointsTableRow({
    endpoint,
}: Readonly<TrafficEndpointsTableRowProps>) {
    const errorRate = endpoint.errorRate;

    return (
        <TableRow className="hover:bg-muted/50 transition-colors">
            {/* Method */}
            <TableCell className="w-24">
                <MethodBadge method={endpoint.method} />
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
            <TableCell className="text-right">
                <Badge
                    variant="outline"
                    className={cn(
                        'text-[10px] tabular-nums font-medium',
                        getErrorRateBadgeClass(errorRate),
                    )}
                >
                    {formatRate(errorRate)}
                </Badge>
            </TableCell>

            {/* Data Transferred */}
            <TableCell className="text-right tabular-nums text-muted-foreground text-xs font-mono">
                {formatBytes(endpoint.dataTransferred)}
            </TableCell>
        </TableRow>
    );
});
