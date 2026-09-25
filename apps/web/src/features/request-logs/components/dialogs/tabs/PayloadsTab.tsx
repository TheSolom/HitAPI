import { useMemo } from 'react';
import { Copy, Check, ArrowDownLeft, ArrowUpRight, Cpu } from 'lucide-react';
import type {
    RequestLogDetailsResponseDto,
    RequestLogResponseDto,
} from '@hitapi/types';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBytes } from '../../../utils';

export interface PayloadsTabProps {
    log: RequestLogResponseDto;
    details?: RequestLogDetailsResponseDto | null;
    isLoading: boolean;
    copiedKey: string | null;
    onCopy: (text: string, key: string) => void;
}

function formatJsonIfPossible(raw?: string | null): string {
    if (!raw) return '';
    try {
        const parsed = JSON.parse(raw) as unknown;
        return JSON.stringify(parsed, null, 2);
    } catch {
        return raw;
    }
}

export function PayloadsTab({
    log,
    details,
    isLoading,
    copiedKey,
    onCopy,
}: Readonly<PayloadsTabProps>) {
    const formattedRequestBody = useMemo(
        () => formatJsonIfPossible(details?.requestBody),
        [details?.requestBody],
    );
    const formattedResponseBody = useMemo(
        () => formatJsonIfPossible(details?.responseBody),
        [details?.responseBody],
    );

    return (
        <TabsContent
            value="payloads"
            className="flex-1 min-h-0 flex flex-col mt-3 pr-1 space-y-3 focus-visible:outline-none"
        >
            {isLoading && <Skeleton className="h-full w-full rounded-lg" />}

            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                    {/* Request Payload */}
                    <div className="rounded-lg border bg-card flex flex-col min-h-0 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b bg-muted/20 px-3.5 py-2 shrink-0">
                            <div className="flex items-center gap-2">
                                <ArrowDownLeft className="h-3.5 w-3.5 text-blue-500" />
                                <h4 className="font-semibold text-xs text-foreground">
                                    Request Body
                                </h4>
                                <Badge
                                    variant="outline"
                                    className="font-mono text-[10px] px-1.5 py-0"
                                >
                                    {formatBytes(log.requestSize)}
                                </Badge>
                            </div>
                            {formattedRequestBody && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-[10px] gap-1"
                                    onClick={() => {
                                        onCopy(
                                            formattedRequestBody,
                                            'req-body',
                                        );
                                    }}
                                >
                                    {copiedKey === 'req-body' ? (
                                        <Check className="h-3 w-3 text-emerald-500" />
                                    ) : (
                                        <Copy className="h-3 w-3" />
                                    )}
                                    Copy
                                </Button>
                            )}
                        </div>
                        <div className="flex-1 min-h-0 overflow-auto bg-muted/30 p-3">
                            {formattedRequestBody ? (
                                <pre className="font-mono text-[11px] text-foreground select-all whitespace-pre-wrap break-all">
                                    {formattedRequestBody}
                                </pre>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground p-6">
                                    <Cpu className="h-6 w-6 mb-2 opacity-40" />
                                    <p className="text-xs font-medium">
                                        No request payload
                                    </p>
                                    <p className="text-[11px]">
                                        This HTTP request did not include a
                                        request body.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Response Payload */}
                    <div className="rounded-lg border bg-card flex flex-col min-h-0 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b bg-muted/20 px-3.5 py-2 shrink-0">
                            <div className="flex items-center gap-2">
                                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                                <h4 className="font-semibold text-xs text-foreground">
                                    Response Body
                                </h4>
                                <Badge
                                    variant="outline"
                                    className="font-mono text-[10px] px-1.5 py-0"
                                >
                                    {formatBytes(log.responseSize)}
                                </Badge>
                            </div>
                            {formattedResponseBody && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-[10px] gap-1"
                                    onClick={() => {
                                        onCopy(
                                            formattedResponseBody,
                                            'res-body',
                                        );
                                    }}
                                >
                                    {copiedKey === 'res-body' ? (
                                        <Check className="h-3 w-3 text-emerald-500" />
                                    ) : (
                                        <Copy className="h-3 w-3" />
                                    )}
                                    Copy
                                </Button>
                            )}
                        </div>
                        <div className="flex-1 min-h-0 overflow-auto bg-muted/30 p-3">
                            {formattedResponseBody ? (
                                <pre className="font-mono text-[11px] text-foreground select-all whitespace-pre-wrap break-all">
                                    {formattedResponseBody}
                                </pre>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground p-6">
                                    <Cpu className="h-6 w-6 mb-2 opacity-40" />
                                    <p className="text-xs font-medium">
                                        No response payload
                                    </p>
                                    <p className="text-[11px]">
                                        No response payload body was captured.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </TabsContent>
    );
}
