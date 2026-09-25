import { useMemo, useState } from 'react';
import { Terminal, Search } from 'lucide-react';
import type { ApplicationLogResponseDto } from '@hitapi/types';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface AppLogsTabProps {
    appLogs?: ApplicationLogResponseDto[];
    isLoading: boolean;
    errorCount: number;
    warnCount: number;
    infoCount: number;
}

function getLogCardClasses(level: string): string {
    if (level === 'ERROR') return 'bg-rose-500/5 border-rose-500/25';
    if (level === 'WARN') return 'bg-amber-500/5 border-amber-500/25';
    return 'bg-muted/20 border-border';
}

function getLogLevelBadgeClasses(level: string): string {
    if (level === 'ERROR')
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    if (level === 'WARN')
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
}

export function AppLogsTab({
    appLogs,
    isLoading,
    errorCount,
    warnCount,
    infoCount,
}: Readonly<AppLogsTabProps>) {
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState<
        'all' | 'ERROR' | 'WARN' | 'INFO'
    >('all');

    const filteredLogs = useMemo(() => {
        const logs = appLogs ?? [];
        return logs.filter((log) => {
            const matchesLevel =
                levelFilter === 'all' ||
                (log.level ?? '').toUpperCase() === levelFilter;
            const matchesSearch =
                !search.trim() ||
                log.message.toLowerCase().includes(search.toLowerCase()) ||
                (log.logger ?? '')
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                (log.file ?? '').toLowerCase().includes(search.toLowerCase());
            return matchesLevel && matchesSearch;
        });
    }, [appLogs, levelFilter, search]);

    return (
        <TabsContent
            value="app-logs"
            className="flex-1 min-h-0 flex flex-col mt-3 pr-1 space-y-3 focus-visible:outline-none"
        >
            <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search log message, logger, file..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                        className="h-8 pl-8 text-xs"
                    />
                </div>

                <div className="flex items-center gap-1.5">
                    <Button
                        variant={levelFilter === 'all' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => {
                            setLevelFilter('all');
                        }}
                    >
                        All ({String((appLogs ?? []).length)})
                    </Button>
                    <Button
                        variant={
                            levelFilter === 'ERROR' ? 'secondary' : 'ghost'
                        }
                        size="sm"
                        className="h-7 text-xs px-2 text-rose-600 dark:text-rose-400"
                        onClick={() => {
                            setLevelFilter('ERROR');
                        }}
                    >
                        Error ({String(errorCount)})
                    </Button>
                    <Button
                        variant={levelFilter === 'WARN' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 text-xs px-2 text-amber-600 dark:text-amber-400"
                        onClick={() => {
                            setLevelFilter('WARN');
                        }}
                    >
                        Warn ({String(warnCount)})
                    </Button>
                    <Button
                        variant={levelFilter === 'INFO' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 text-xs px-2 text-blue-600 dark:text-blue-400"
                        onClick={() => {
                            setLevelFilter('INFO');
                        }}
                    >
                        Info ({String(infoCount)})
                    </Button>
                </div>
            </div>

            {isLoading && <Skeleton className="h-full w-full rounded-lg" />}

            {!isLoading && (
                <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border bg-card p-2 space-y-2">
                    {filteredLogs.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground p-8">
                            <Terminal className="h-8 w-8 mb-2 opacity-40" />
                            <p className="text-sm font-medium">
                                No application logs found
                            </p>
                            <p className="text-xs">
                                {search.trim() || levelFilter !== 'all'
                                    ? 'No internal logs match the current search and level filters.'
                                    : 'No internal application logs were captured during this request execution.'}
                            </p>
                        </div>
                    ) : (
                        filteredLogs.map((appLog, i) => {
                            const level = (
                                appLog.level ?? 'INFO'
                            ).toUpperCase();

                            return (
                                <div
                                    key={`log-${String(i)}`}
                                    className={cn(
                                        'rounded-md border p-2.5 text-xs font-mono space-y-1.5 transition-colors',
                                        getLogCardClasses(level),
                                    )}
                                >
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'uppercase text-[10px] px-1.5 py-0 font-semibold',
                                                    getLogLevelBadgeClasses(
                                                        level,
                                                    ),
                                                )}
                                            >
                                                {level}
                                            </Badge>
                                            {appLog.logger && (
                                                <span className="text-foreground font-semibold">
                                                    [{appLog.logger}]
                                                </span>
                                            )}
                                            {(appLog.file ||
                                                Boolean(appLog.line)) && (
                                                <span className="text-[10px] text-muted-foreground truncate">
                                                    {appLog.file}
                                                    {appLog.line
                                                        ? `:${String(appLog.line)}`
                                                        : ''}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-muted-foreground">
                                            {new Date(
                                                appLog.timestamp,
                                            ).toLocaleTimeString(undefined, {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                                fractionalSecondDigits: 3,
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-foreground whitespace-pre-wrap break-all text-xs pl-0.5">
                                        {appLog.message}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </TabsContent>
    );
}
