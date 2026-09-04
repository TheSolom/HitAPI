import { useState } from 'react';
import {
    MoreHorizontal,
    Eye,
    SlidersHorizontal,
    AlertTriangle,
    Activity,
} from 'lucide-react';
import type { EndpointResponseDto } from '@hitapi/types';
import { RestfulMethod } from '@hitapi/shared/enums';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useUpdateEndpointConfigMutation } from '../hooks';
import { EndpointConfigDialog } from './EndpointConfigDialog';
import { EndpointErrorConfigDialog } from './EndpointErrorConfigDialog';
import { EndpointDetailsDialog } from './EndpointDetailsDialog';

interface EndpointsTableProps {
    readonly appId: string;
    readonly endpoints: EndpointResponseDto[];
}

function getMethodBadgeVariant(
    method: RestfulMethod,
): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (method) {
        case RestfulMethod.GET:
            return 'secondary';
        case RestfulMethod.POST:
            return 'default';
        case RestfulMethod.DELETE:
            return 'destructive';
        default:
            return 'outline';
    }
}

export function EndpointsTable({ appId, endpoints }: EndpointsTableProps) {
    const [detailsEndpoint, setDetailsEndpoint] =
        useState<EndpointResponseDto | null>(null);
    const [configEndpoint, setConfigEndpoint] =
        useState<EndpointResponseDto | null>(null);
    const [errorConfigEndpoint, setErrorConfigEndpoint] =
        useState<EndpointResponseDto | null>(null);

    const updateEndpointConfig = useUpdateEndpointConfigMutation();

    const handleToggleMonitoring = (endpoint: EndpointResponseDto) => {
        updateEndpointConfig.mutate({
            appId,
            payload: {
                method: endpoint.method,
                path: endpoint.path,
                excluded: !endpoint.excluded,
            },
        });
    };

    const handleSwitchChange = (
        endpoint: EndpointResponseDto,
        checked: boolean,
    ) => {
        updateEndpointConfig.mutate({
            appId,
            payload: {
                method: endpoint.method,
                path: endpoint.path,
                excluded: !checked,
            },
        });
    };

    return (
        <>
            <div className="rounded-lg border bg-card">
                <Table>
                    <caption className="sr-only">
                        Discovered endpoints and configurations
                    </caption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-28">Method</TableHead>
                            <TableHead className="w-64 sm:w-80">
                                Route Path
                            </TableHead>
                            <TableHead>Summary</TableHead>
                            <TableHead className="w-32 text-center">
                                Monitored
                            </TableHead>
                            <TableHead className="w-16 text-right">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {endpoints.map((endpoint) => (
                            <TableRow
                                key={endpoint.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => {
                                    setDetailsEndpoint(endpoint);
                                }}
                            >
                                <TableCell>
                                    <Badge
                                        variant={getMethodBadgeVariant(
                                            endpoint.method,
                                        )}
                                    >
                                        {endpoint.method}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="font-mono text-sm font-bold text-foreground">
                                        {endpoint.path}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {endpoint.summary ? (
                                        <span className="text-sm text-muted-foreground line-clamp-1">
                                            {endpoint.summary}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground/40 italic">
                                            —
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell
                                    className="text-center"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                    }}
                                >
                                    <div className="flex items-center justify-center">
                                        <Switch
                                            checked={!endpoint.excluded}
                                            aria-label={`Monitor ${endpoint.method} ${endpoint.path}`}
                                            onCheckedChange={(checked) => {
                                                handleSwitchChange(
                                                    endpoint,
                                                    checked,
                                                );
                                            }}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell
                                    className="text-right"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                    }}
                                >
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                aria-label={`Actions for ${endpoint.method} ${endpoint.path}`}
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setDetailsEndpoint(
                                                        endpoint,
                                                    );
                                                }}
                                            >
                                                <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                                View details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setConfigEndpoint(endpoint);
                                                }}
                                            >
                                                <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                                                Configure latency
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setErrorConfigEndpoint(
                                                        endpoint,
                                                    );
                                                }}
                                            >
                                                <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
                                                Configure error policy
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    handleToggleMonitoring(
                                                        endpoint,
                                                    );
                                                }}
                                            >
                                                <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {endpoint.excluded
                                                    ? 'Enable monitoring'
                                                    : 'Disable monitoring'}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {detailsEndpoint ? (
                <EndpointDetailsDialog
                    appId={appId}
                    endpoint={detailsEndpoint}
                    open={Boolean(detailsEndpoint)}
                    onOpenChange={(open) => {
                        if (!open) {
                            setDetailsEndpoint(null);
                        }
                    }}
                />
            ) : null}

            {configEndpoint ? (
                <EndpointConfigDialog
                    appId={appId}
                    endpoint={configEndpoint}
                    open={Boolean(configEndpoint)}
                    onOpenChange={(open) => {
                        if (!open) {
                            setConfigEndpoint(null);
                        }
                    }}
                />
            ) : null}

            {errorConfigEndpoint ? (
                <EndpointErrorConfigDialog
                    appId={appId}
                    endpoint={errorConfigEndpoint}
                    open={Boolean(errorConfigEndpoint)}
                    onOpenChange={(open) => {
                        if (!open) {
                            setErrorConfigEndpoint(null);
                        }
                    }}
                />
            ) : null}
        </>
    );
}
