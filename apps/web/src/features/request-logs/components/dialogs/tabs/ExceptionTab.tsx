import { Copy, Check, ShieldAlert } from 'lucide-react';
import type { RequestLogDetailsResponseDto } from '@hitapi/types';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export interface ExceptionTabProps {
    details?: RequestLogDetailsResponseDto | null;
    copiedKey: string | null;
    onCopy: (text: string, key: string) => void;
}

export function ExceptionTab({
    details,
    copiedKey,
    onCopy,
}: Readonly<ExceptionTabProps>) {
    return (
        <TabsContent
            value="exception"
            className="flex-1 min-h-0 flex flex-col mt-3 pr-1 space-y-3 focus-visible:outline-none"
        >
            <div className="rounded-lg border border-rose-500/25 bg-rose-500/5 p-3.5 space-y-1.5 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
                        <h4 className="font-semibold text-xs text-rose-600 dark:text-rose-400">
                            {details?.exceptionType || 'Application Exception'}
                        </h4>
                    </div>
                    {details?.exceptionStacktrace && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[11px] gap-1 text-rose-600 border-rose-200 dark:border-rose-900 dark:text-rose-400 hover:bg-rose-500/10"
                            onClick={() => {
                                onCopy(
                                    details.exceptionStacktrace ?? '',
                                    'stacktrace',
                                );
                            }}
                        >
                            {copiedKey === 'stacktrace' ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                                <Copy className="h-3.5 w-3.5" />
                            )}
                            Copy Stacktrace
                        </Button>
                    )}
                </div>
                <p className="font-mono text-foreground font-medium text-xs break-all">
                    {details?.exceptionMessage}
                </p>
            </div>

            <div className="flex-1 min-h-0 flex flex-col rounded-lg border bg-zinc-950 text-zinc-100 p-3 overflow-hidden shadow-inner font-mono text-xs">
                <div className="text-[11px] text-zinc-400 uppercase tracking-wider mb-2 font-semibold flex items-center justify-between border-b border-zinc-800 pb-1.5 shrink-0">
                    <span>Stacktrace</span>
                    <span className="text-[10px] text-zinc-500">
                        Captured at runtime
                    </span>
                </div>
                <pre className="flex-1 min-h-0 overflow-auto select-all text-[11px] leading-relaxed text-zinc-200">
                    {details?.exceptionStacktrace || 'No stacktrace available'}
                </pre>
            </div>
        </TabsContent>
    );
}
