import { useCallback, useMemo, useState } from 'react';
import { Layers, FileCode, Cpu, Terminal, ShieldAlert } from 'lucide-react';
import type {
    ApplicationLogResponseDto,
    RequestLogDetailsResponseDto,
    RequestLogResponseDto,
} from '@hitapi/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    EndpointPath,
    LatencyBadge,
    MethodBadge,
    StatusCodeBadge,
    TimestampBadge,
} from '@/components/common';
import { cn } from '@/lib/utils';
import {
    useApplicationLogsQuery,
    useRequestLogDetailsQuery,
} from '../../hooks';
import {
    OverviewTab,
    HeadersTab,
    PayloadsTab,
    AppLogsTab,
    ExceptionTab,
} from './tabs';

export interface RequestLogDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    log: RequestLogResponseDto | null;
    appId: string;
}

function getTimestampString(
    rawLog: RequestLogResponseDto | null,
): string | undefined {
    if (!rawLog) return undefined;
    if (typeof rawLog.timestamp === 'string') return rawLog.timestamp;
    return rawLog.timestamp.toISOString();
}

function getLogLevelCounts(logs: ApplicationLogResponseDto[] = []) {
    let errorCount = 0;
    let warnCount = 0;
    let infoCount = 0;
    for (const log of logs) {
        const level = (log.level ?? '').toUpperCase();
        if (level === 'ERROR') errorCount++;
        else if (level === 'WARN') warnCount++;
        else if (level === 'INFO') infoCount++;
    }
    return { errorCount, warnCount, infoCount };
}

function checkHasException(
    details?: RequestLogDetailsResponseDto | null,
): boolean {
    return Boolean(
        details?.exceptionType ||
        details?.exceptionMessage ||
        details?.exceptionStacktrace,
    );
}

export function RequestLogDetailsDialog({
    open,
    onOpenChange,
    log,
    appId,
}: Readonly<RequestLogDetailsDialogProps>) {
    const [activeTab, setActiveTab] = useState('overview');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const timestampStr = getTimestampString(log);

    const { data: details, isLoading: detailsLoading } =
        useRequestLogDetailsQuery(log?.requestUuid, appId, timestampStr);

    const { data: appLogs, isLoading: appLogsLoading } =
        useApplicationLogsQuery(log?.requestUuid, appId);

    const handleCopy = useCallback((text: string, key: string) => {
        void navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => {
            setCopiedKey(null);
        }, 2000);
    }, []);

    const { errorCount, warnCount, infoCount } = useMemo(
        () => getLogLevelCounts(appLogs),
        [appLogs],
    );

    const hasException = checkHasException(details);

    const totalHeadersCount =
        (details?.requestHeaders ?? []).length +
        (details?.responseHeaders ?? []).length;

    if (!log) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-175 max-h-[92vh] min-h-137.5 w-full max-w-5xl overflow-hidden p-0 flex flex-col shadow-2xl">
                {/* Header with Title & Metadata Bar */}
                <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-muted/15">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <MethodBadge method={log.method} />
                            <StatusCodeBadge
                                statusCode={log.statusCode}
                                statusText={log.statusText}
                                showText
                            />
                            <LatencyBadge ms={log.responseTime} />
                            <TimestampBadge date={log.timestamp} />
                        </div>
                    </div>

                    <div className="mt-2.5">
                        <DialogTitle className="font-mono text-sm break-all font-medium flex items-center gap-2">
                            <EndpointPath path={log.path} />
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Details and diagnostics for HTTP request{' '}
                            {log.requestUuid}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                {/* Tabs Container */}
                <div className="flex-1 overflow-hidden p-6 pt-3 flex flex-col min-h-0 bg-background">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="flex-1 flex flex-col min-h-0"
                    >
                        <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-flex shrink-0 border bg-muted/40 p-1">
                            <TabsTrigger
                                value="overview"
                                className="text-xs gap-1.5 data-[state=active]:bg-background"
                            >
                                <Layers className="h-3.5 w-3.5" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="headers"
                                className="text-xs gap-1.5 data-[state=active]:bg-background"
                            >
                                <FileCode className="h-3.5 w-3.5" />
                                Headers
                                <span className="ml-1 rounded-full bg-muted-foreground/15 px-1.5 py-0.2 text-[10px] font-mono">
                                    {String(totalHeadersCount)}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="payloads"
                                className="text-xs gap-1.5 data-[state=active]:bg-background"
                            >
                                <Cpu className="h-3.5 w-3.5" />
                                Payloads
                            </TabsTrigger>
                            <TabsTrigger
                                value="app-logs"
                                className="text-xs gap-1.5 data-[state=active]:bg-background"
                            >
                                <Terminal className="h-3.5 w-3.5" />
                                App Logs
                                <span
                                    className={cn(
                                        'ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono',
                                        errorCount > 0
                                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold'
                                            : 'bg-muted-foreground/15 text-muted-foreground',
                                    )}
                                >
                                    {String((appLogs ?? []).length)}
                                </span>
                            </TabsTrigger>
                            {hasException && (
                                <TabsTrigger
                                    value="exception"
                                    className="text-xs gap-1.5 text-rose-600 dark:text-rose-400 font-semibold data-[state=active]:bg-rose-500/10 data-[state=active]:text-rose-600"
                                >
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                    Exception
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <OverviewTab
                            log={log}
                            details={details}
                            appLogs={appLogs}
                            copiedKey={copiedKey}
                            onCopy={handleCopy}
                            onNavigateTab={setActiveTab}
                            hasException={hasException}
                            errorCount={errorCount}
                            warnCount={warnCount}
                            infoCount={infoCount}
                        />

                        <HeadersTab
                            details={details}
                            isLoading={detailsLoading}
                            copiedKey={copiedKey}
                            onCopy={handleCopy}
                        />

                        <PayloadsTab
                            log={log}
                            details={details}
                            isLoading={detailsLoading}
                            copiedKey={copiedKey}
                            onCopy={handleCopy}
                        />

                        <AppLogsTab
                            appLogs={appLogs}
                            isLoading={appLogsLoading}
                            errorCount={errorCount}
                            warnCount={warnCount}
                            infoCount={infoCount}
                        />

                        {hasException && (
                            <ExceptionTab
                                details={details}
                                copiedKey={copiedKey}
                                onCopy={handleCopy}
                            />
                        )}
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
