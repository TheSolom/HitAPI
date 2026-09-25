import { Eye } from 'lucide-react';
import type { RequestLogResponseDto } from '@hitapi/types';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    EndpointPath,
    LatencyBadge,
    MethodBadge,
    StatusCodeBadge,
} from '@/components/common';
import { formatBytes } from '../../utils';

export interface RequestLogsTableRowProps {
    log: RequestLogResponseDto;
    onViewDetails: (log: RequestLogResponseDto) => void;
}

export function RequestLogsTableRow({
    log,
    onViewDetails,
}: Readonly<RequestLogsTableRowProps>) {
    return (
        <TableRow
            className="cursor-pointer transition-colors hover:bg-muted/40 text-xs"
            onClick={() => {
                onViewDetails(log);
            }}
        >
            {/* Status Code (Shared reusable component) */}
            <TableCell className="w-24 pl-4 font-mono font-medium">
                <StatusCodeBadge statusCode={log.statusCode} />
            </TableCell>

            {/* Method (Shared reusable component) */}
            <TableCell className="w-20">
                <MethodBadge method={log.method} />
            </TableCell>

            {/* Path (Shared reusable component) */}
            <TableCell className="max-w-64">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="block truncate select-all">
                                <EndpointPath path={log.path} />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md break-all font-mono text-[11px]">
                            {log.url}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </TableCell>

            {/* Response Time / Latency (Shared reusable component) */}
            <TableCell className="w-24">
                <LatencyBadge ms={log.responseTime} />
            </TableCell>

            {/* Consumer */}
            <TableCell className="max-w-32.5 truncate">
                {(log.consumerName ?? log.consumerIdentifier) ? (
                    <span className="font-medium text-foreground">
                        {log.consumerName ?? log.consumerIdentifier}
                    </span>
                ) : (
                    <span className="text-muted-foreground italic">
                        Anonymous
                    </span>
                )}
            </TableCell>

            {/* Client IP & Country */}
            <TableCell className="w-36 font-mono text-muted-foreground truncate">
                <div className="flex flex-col">
                    <span className="text-foreground">
                        {log.clientIp ?? '-'}
                    </span>
                    {log.clientCountryName && (
                        <span className="text-[10px] text-muted-foreground">
                            {log.clientCountryName}
                        </span>
                    )}
                </div>
            </TableCell>

            {/* Payload Size */}
            <TableCell className="w-24 font-mono text-muted-foreground text-[11px]">
                <div className="flex flex-col">
                    <span>In: {formatBytes(log.requestSize)}</span>
                    <span>Out: {formatBytes(log.responseSize)}</span>
                </div>
            </TableCell>

            {/* Timestamp */}
            <TableCell className="w-32 text-muted-foreground text-[11px]">
                {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                })}
            </TableCell>

            {/* View Details Action */}
            <TableCell className="w-12 pr-4 text-right">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(log);
                    }}
                    title="View request details"
                >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="sr-only">View request details</span>
                </Button>
            </TableCell>
        </TableRow>
    );
}
