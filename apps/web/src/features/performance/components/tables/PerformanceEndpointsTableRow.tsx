import { memo } from 'react';
import type { PerformanceEndpointsTableResponseDto } from '@hitapi/types';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { EndpointPath, MethodBadge } from '@/components/common';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/format';
import { formatApdex, formatResponseTime, getApdexRating } from '../../utils';

export interface PerformanceEndpointsTableRowProps {
    endpoint: PerformanceEndpointsTableResponseDto;
}

function getP95Class(p95: number, targetMs: number): string {
    if (p95 > targetMs * 4) return 'text-destructive font-medium';
    if (p95 > targetMs) return 'text-amber-500 font-medium';
    return 'text-muted-foreground';
}

export const PerformanceEndpointsTableRow = memo(
    function PerformanceEndpointsTableRow({
        endpoint,
    }: Readonly<PerformanceEndpointsTableRowProps>) {
        const rating = getApdexRating(endpoint.apdexScore);
        const targetMs = endpoint.targetResponseTimeMs || 500;

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

                {/* P50 Response Time */}
                <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatResponseTime(endpoint.responseTimeP50)}
                </TableCell>

                {/* P75 Response Time */}
                <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatResponseTime(endpoint.responseTimeP75)}
                </TableCell>

                {/* P95 Response Time */}
                <TableCell className="text-right tabular-nums">
                    <span
                        className={cn(
                            'font-mono text-xs',
                            getP95Class(endpoint.responseTimeP95, targetMs),
                        )}
                    >
                        {formatResponseTime(endpoint.responseTimeP95)}
                    </span>
                </TableCell>

                {/* Apdex Score */}
                <TableCell className="text-right">
                    <Badge
                        variant="outline"
                        className={cn(
                            'text-[10px] tabular-nums font-medium',
                            rating.colorClass,
                        )}
                    >
                        {formatApdex(endpoint.apdexScore)} ({rating.label})
                    </Badge>
                </TableCell>
            </TableRow>
        );
    },
);
