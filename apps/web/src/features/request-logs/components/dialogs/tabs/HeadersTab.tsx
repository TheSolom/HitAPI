import { useMemo, useState } from 'react';
import { Copy, Check, Search, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { RequestLogDetailsResponseDto } from '@hitapi/types';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

export interface HeadersTabProps {
    details?: RequestLogDetailsResponseDto | null;
    isLoading: boolean;
    copiedKey: string | null;
    onCopy: (text: string, key: string) => void;
}

export function HeadersTab({
    details,
    isLoading,
    copiedKey,
    onCopy,
}: Readonly<HeadersTabProps>) {
    const [search, setSearch] = useState('');

    const filteredRequestHeaders = useMemo(() => {
        const headers = details?.requestHeaders ?? [];
        if (!search.trim()) return headers;
        const q = search.toLowerCase();
        return headers.filter(
            ([k, v]) =>
                k.toLowerCase().includes(q) || v.toLowerCase().includes(q),
        );
    }, [details?.requestHeaders, search]);

    const filteredResponseHeaders = useMemo(() => {
        const headers = details?.responseHeaders ?? [];
        if (!search.trim()) return headers;
        const q = search.toLowerCase();
        return headers.filter(
            ([k, v]) =>
                k.toLowerCase().includes(q) || v.toLowerCase().includes(q),
        );
    }, [details?.responseHeaders, search]);

    return (
        <TabsContent
            value="headers"
            className="flex-1 min-h-0 flex flex-col mt-3 pr-1 space-y-3 focus-visible:outline-none"
        >
            <div className="flex items-center justify-between gap-3 shrink-0">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Filter headers by key or value..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                        className="h-8 pl-8 text-xs"
                    />
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                    {String(
                        filteredRequestHeaders.length +
                            filteredResponseHeaders.length,
                    )}{' '}
                    headers shown
                </span>
            </div>

            {isLoading && <Skeleton className="h-full w-full rounded-lg" />}

            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                    {/* Request Headers */}
                    <div className="rounded-lg border bg-card flex flex-col min-h-0 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b bg-muted/20 px-3.5 py-2 shrink-0">
                            <div className="flex items-center gap-2">
                                <ArrowDownLeft className="h-3.5 w-3.5 text-blue-500" />
                                <h4 className="font-semibold text-xs text-foreground">
                                    Request Headers
                                </h4>
                                <Badge
                                    variant="secondary"
                                    className="font-mono text-[10px] px-1.5 py-0"
                                >
                                    {String(filteredRequestHeaders.length)}
                                </Badge>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[10px] gap-1"
                                onClick={() => {
                                    onCopy(
                                        JSON.stringify(
                                            details?.requestHeaders ?? [],
                                            null,
                                            2,
                                        ),
                                        'req-headers',
                                    );
                                }}
                            >
                                {copiedKey === 'req-headers' ? (
                                    <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                    <Copy className="h-3 w-3" />
                                )}
                                Copy
                            </Button>
                        </div>
                        <div className="flex-1 min-h-0 overflow-y-auto divide-y">
                            {filteredRequestHeaders.map(([k, v]) => (
                                <div
                                    key={`req-${k}`}
                                    className="flex flex-col sm:flex-row sm:items-start px-3.5 py-2 font-mono text-xs hover:bg-muted/30 transition-colors gap-1 sm:gap-2"
                                >
                                    <span className="sm:w-1/3 text-muted-foreground font-semibold truncate shrink-0">
                                        {k}:
                                    </span>
                                    <span className="sm:w-2/3 text-foreground break-all select-all font-normal">
                                        {v}
                                    </span>
                                </div>
                            ))}
                            {filteredRequestHeaders.length === 0 && (
                                <div className="p-8 text-center text-xs text-muted-foreground">
                                    No request headers match your filter
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Response Headers */}
                    <div className="rounded-lg border bg-card flex flex-col min-h-0 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b bg-muted/20 px-3.5 py-2 shrink-0">
                            <div className="flex items-center gap-2">
                                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                                <h4 className="font-semibold text-xs text-foreground">
                                    Response Headers
                                </h4>
                                <Badge
                                    variant="secondary"
                                    className="font-mono text-[10px] px-1.5 py-0"
                                >
                                    {String(filteredResponseHeaders.length)}
                                </Badge>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[10px] gap-1"
                                onClick={() => {
                                    onCopy(
                                        JSON.stringify(
                                            details?.responseHeaders ?? [],
                                            null,
                                            2,
                                        ),
                                        'res-headers',
                                    );
                                }}
                            >
                                {copiedKey === 'res-headers' ? (
                                    <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                    <Copy className="h-3 w-3" />
                                )}
                                Copy
                            </Button>
                        </div>
                        <div className="flex-1 min-h-0 overflow-y-auto divide-y">
                            {filteredResponseHeaders.map(([k, v]) => (
                                <div
                                    key={`res-${k}`}
                                    className="flex flex-col sm:flex-row sm:items-start px-3.5 py-2 font-mono text-xs hover:bg-muted/30 transition-colors gap-1 sm:gap-2"
                                >
                                    <span className="sm:w-1/3 text-muted-foreground font-semibold truncate shrink-0">
                                        {k}:
                                    </span>
                                    <span className="sm:w-2/3 text-foreground break-all select-all font-normal">
                                        {v}
                                    </span>
                                </div>
                            ))}
                            {filteredResponseHeaders.length === 0 && (
                                <div className="p-8 text-center text-xs text-muted-foreground">
                                    No response headers match your filter
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </TabsContent>
    );
}
