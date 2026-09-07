import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import type { ServerErrorsTableResponseDto } from '@hitapi/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ServerErrorTracebackDialogProps {
    readonly error: ServerErrorsTableResponseDto | null;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

export function ServerErrorTracebackDialog({
    error,
    open,
    onOpenChange,
}: ServerErrorTracebackDialogProps) {
    const [copied, setCopied] = useState(false);

    if (!error) return null;

    const handleCopy = () => {
        void navigator.clipboard.writeText(error.traceback);
        setCopied(true);
        toast.success('Traceback copied to clipboard');
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader className="space-y-1 pb-2 border-b">
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="bg-destructive/10 text-destructive border-destructive/20 text-xs font-mono"
                        >
                            {error.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            Occurrences: {error.errorCount}
                        </span>
                    </div>
                    <DialogTitle className="text-base font-semibold break-all">
                        {error.msg}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Stack trace recorded from application runtime exception
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col space-y-2 py-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                        <span className="flex items-center gap-1.5 font-mono">
                            <Terminal className="h-3.5 w-3.5" />
                            Exception Traceback
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1.5"
                            onClick={handleCopy}
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>Copy Traceback</span>
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="flex-1 overflow-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs text-zinc-100 border border-zinc-800 selection:bg-zinc-800">
                        <pre className="whitespace-pre-wrap break-all leading-relaxed">
                            {error.traceback || 'No traceback captured.'}
                        </pre>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
