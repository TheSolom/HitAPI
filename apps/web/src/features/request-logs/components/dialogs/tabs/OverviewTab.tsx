import {
    Copy,
    Check,
    Globe,
    Server,
    Terminal,
    ShieldAlert,
    ArrowDownLeft,
    ArrowUpRight,
    Clock,
    User,
    Cpu,
} from 'lucide-react';
import type {
    ApplicationLogResponseDto,
    RequestLogDetailsResponseDto,
    RequestLogResponseDto,
} from '@hitapi/types';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LatencyBadge, StatusCodeBadge } from '@/components/common';
import { formatBytes } from '../../../utils';

export interface OverviewTabProps {
    log: RequestLogResponseDto;
    details?: RequestLogDetailsResponseDto | null;
    appLogs?: ApplicationLogResponseDto[];
    copiedKey: string | null;
    onCopy: (text: string, key: string) => void;
    onNavigateTab: (tab: string) => void;
    hasException: boolean;
    errorCount: number;
    warnCount: number;
    infoCount: number;
}

export function OverviewTab({
    log,
    details,
    appLogs,
    copiedKey,
    onCopy,
    onNavigateTab,
    hasException,
    errorCount,
    warnCount,
    infoCount,
}: Readonly<OverviewTabProps>) {
    return (
        <TabsContent
            value="overview"
            className="flex-1 min-h-0 flex flex-col mt-3 pr-1 gap-3.5 focus-visible:outline-none overflow-y-auto"
        >
            {/* Target URL Hero Card */}
            <div className="rounded-lg border bg-card p-3 shadow-sm space-y-1.5 shrink-0">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-foreground">
                        <Globe className="h-3.5 w-3.5 text-primary" /> Request
                        Target URL
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md bg-muted/30 p-2 font-mono text-xs border">
                    <span className="text-foreground break-all select-all font-medium">
                        {log.url}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 shrink-0 text-xs gap-1"
                        onClick={() => {
                            onCopy(log.url, 'url');
                        }}
                        title="Copy Full URL"
                    >
                        {copiedKey === 'url' ? (
                            <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span>Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* 4 Diagnostic Stat Cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 flex-1 min-h-0">
                {/* Client & Origin */}
                <div className="rounded-lg border bg-card p-3.5 shadow-sm flex flex-col justify-between h-full">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <Server className="h-3.5 w-3.5 text-blue-500" />
                        <span>Client & Origin</span>
                    </div>
                    <div className="space-y-2 text-xs flex-1 flex flex-col justify-center py-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                                Client IP:
                            </span>
                            <span className="font-mono font-medium text-foreground">
                                {log.clientIp ?? 'Unknown'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                                Location:
                            </span>
                            <span className="font-medium text-foreground">
                                {log.clientCountryName ??
                                    log.clientCountryCode ??
                                    'Unknown'}
                            </span>
                        </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground border-t pt-2 truncate">
                        Country Code:{' '}
                        <span className="font-mono font-medium uppercase">
                            {log.clientCountryCode ?? 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Consumer Identity */}
                <div className="rounded-lg border bg-card p-3.5 shadow-sm flex flex-col justify-between h-full">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <User className="h-3.5 w-3.5 text-purple-500" />
                        <span>Consumer Identity</span>
                    </div>
                    <div className="space-y-2 text-xs flex-1 flex flex-col justify-center py-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium text-foreground truncate max-w-28">
                                {log.consumerName ?? 'None'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                                Identifier:
                            </span>
                            <span className="font-mono font-medium text-foreground truncate max-w-28">
                                {log.consumerIdentifier ?? 'Anonymous'}
                            </span>
                        </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground border-t pt-2 truncate">
                        Group:{' '}
                        <span className="font-medium text-foreground">
                            {details?.consumerGroupName ??
                                log.consumerGroupName ??
                                'None'}
                        </span>
                    </div>
                </div>

                {/* Payload Sizes */}
                <div className="rounded-lg border bg-card p-3.5 shadow-sm flex flex-col justify-between h-full">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Payload Sizes</span>
                    </div>
                    <div className="space-y-2 text-xs font-mono flex-1 flex flex-col justify-center py-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground font-sans flex items-center gap-1">
                                <ArrowDownLeft className="h-3 w-3 text-blue-500" />{' '}
                                Req:
                            </span>
                            <span className="font-medium text-foreground">
                                {formatBytes(log.requestSize)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground font-sans flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3 text-emerald-500" />{' '}
                                Res:
                            </span>
                            <span className="font-medium text-foreground">
                                {formatBytes(log.responseSize)}
                            </span>
                        </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground border-t pt-2 truncate">
                        Type:{' '}
                        <span className="font-mono">
                            {details?.responseContentType || 'application/json'}
                        </span>
                    </div>
                </div>

                {/* Timing & Latency */}
                <div className="rounded-lg border bg-card p-3.5 shadow-sm flex flex-col justify-between h-full">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span>Execution Latency</span>
                    </div>
                    <div className="space-y-2 text-xs flex-1 flex flex-col justify-center py-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                                Server Latency:
                            </span>
                            <LatencyBadge ms={log.responseTime} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                                HTTP Status:
                            </span>
                            <StatusCodeBadge
                                statusCode={log.statusCode}
                                statusText={log.statusText}
                                showText
                            />
                        </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground border-t pt-2">
                        Completed:{' '}
                        <span>
                            {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Diagnostics Summary Grid */}
            <div className="grid gap-3 sm:grid-cols-2 flex-1 min-h-0">
                {/* Distributed Tracing */}
                <div className="rounded-lg border bg-card p-3.5 shadow-sm flex flex-col justify-between h-full">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5 text-primary" /> Distributed
                        Tracing
                    </span>
                    <div className="my-auto py-2">
                        <div className="flex items-center justify-between rounded bg-muted/20 p-2.5 border font-mono">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    Trace ID
                                </span>
                                <span className="text-xs text-foreground font-semibold select-all break-all">
                                    {details?.traceId ?? 'No trace ID attached'}
                                </span>
                            </div>
                            {details?.traceId && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 shrink-0"
                                    onClick={() => {
                                        onCopy(details.traceId ?? '', 'trace');
                                    }}
                                    title="Copy Trace ID"
                                >
                                    {copiedKey === 'trace' ? (
                                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Application Log Diagnostics Banner */}
                <div className="rounded-lg border bg-card p-3.5 shadow-sm flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Terminal className="h-3.5 w-3.5 text-primary" />{' '}
                            Application Diagnostics
                        </span>
                        <Badge
                            variant="outline"
                            className="text-[10px] font-mono"
                        >
                            {String((appLogs ?? []).length)} records
                        </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 text-center my-auto py-2">
                        <div className="rounded-md border bg-rose-500/5 border-rose-500/20 p-2.5 flex flex-col justify-center">
                            <div className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono">
                                {String(errorCount)}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">
                                Errors
                            </div>
                        </div>
                        <div className="rounded-md border bg-amber-500/5 border-amber-500/20 p-2.5 flex flex-col justify-center">
                            <div className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono">
                                {String(warnCount)}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">
                                Warnings
                            </div>
                        </div>
                        <div className="rounded-md border bg-blue-500/5 border-blue-500/20 p-2.5 flex flex-col justify-center">
                            <div className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
                                {String(infoCount)}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">
                                Info
                            </div>
                        </div>
                    </div>

                    {hasException && (
                        <div className="flex items-center justify-between text-xs pt-1.5 border-t">
                            <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 text-[11px]">
                                <ShieldAlert className="h-3.5 w-3.5" /> Uncaught
                                exception occurred
                            </span>
                            <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs text-rose-600 dark:text-rose-400"
                                onClick={() => {
                                    onNavigateTab('exception');
                                }}
                            >
                                View Exception &rarr;
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </TabsContent>
    );
}
