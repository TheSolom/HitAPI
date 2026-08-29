import { useState } from 'react';
import {
    SlidersHorizontal,
    Clock,
    Activity,
    AlertTriangle,
} from 'lucide-react';
import type { EndpointResponseDto } from '@hitapi/types';
import { RestfulMethod } from '@hitapi/shared/enums';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { EndpointConfigDialog } from './EndpointConfigDialog';
import { EndpointErrorConfigDialog } from './EndpointErrorConfigDialog';

interface EndpointDetailsDialogProps {
    readonly appId: string;
    readonly endpoint: EndpointResponseDto;
    readonly trigger?: React.ReactNode;
    readonly open?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
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

export function EndpointDetailsDialog({
    appId,
    endpoint,
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
}: EndpointDetailsDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen ?? internalOpen;
    const setIsOpen = externalOnOpenChange ?? setInternalOpen;

    const targetLatencyText =
        typeof endpoint.targetResponseTimeMs === 'number'
            ? `${String(endpoint.targetResponseTimeMs)} ms`
            : 'Default (500 ms)';

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-md sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Badge variant={getMethodBadgeVariant(endpoint.method)}>
                            {endpoint.method}
                        </Badge>
                        <DialogTitle className="font-mono text-base break-all">
                            {endpoint.path}
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        Endpoint metadata, response time thresholds, and
                        monitoring configuration.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {endpoint.summary ? (
                        <div className="rounded-md border bg-muted/40 p-3">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">
                                Summary
                            </span>
                            <p className="mt-1 text-sm font-medium">
                                {endpoint.summary}
                            </p>
                        </div>
                    ) : null}

                    {endpoint.description ? (
                        <div className="rounded-md border bg-muted/40 p-3">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">
                                Description
                            </span>
                            <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                                {endpoint.description}
                            </p>
                        </div>
                    ) : null}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1 rounded-md border p-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Target Latency</span>
                            </div>
                            <span className="text-sm font-semibold">
                                {targetLatencyText}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1 rounded-md border p-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Activity className="h-3.5 w-3.5" />
                                <span>Monitoring Status</span>
                            </div>
                            <div>
                                <Badge
                                    variant={
                                        endpoint.excluded
                                            ? 'secondary'
                                            : 'default'
                                    }
                                >
                                    {endpoint.excluded
                                        ? 'Excluded'
                                        : 'Monitored'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between items-center">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <EndpointConfigDialog
                            appId={appId}
                            endpoint={endpoint}
                            trigger={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                >
                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                    <span>Configure</span>
                                </Button>
                            }
                        />
                        <EndpointErrorConfigDialog
                            appId={appId}
                            endpoint={endpoint}
                            trigger={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                >
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    <span>Error Policy</span>
                                </Button>
                            }
                        />
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setIsOpen(false);
                        }}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
