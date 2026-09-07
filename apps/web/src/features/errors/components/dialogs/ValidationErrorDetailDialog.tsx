import type { ValidationErrorsTableResponseDto } from '@hitapi/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ValidationErrorDetailDialogProps {
    readonly error: ValidationErrorsTableResponseDto | null;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

export function ValidationErrorDetailDialog({
    error,
    open,
    onOpenChange,
}: ValidationErrorDetailDialogProps) {
    if (!error) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader className="space-y-1 pb-2 border-b">
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-mono"
                        >
                            {error.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            Occurrences: {error.errorCount}
                        </span>
                    </div>
                    <DialogTitle className="text-base font-semibold">
                        Validation Failure Details
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Schema validation issue rejected by API framework
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2 text-xs">
                    <div className="space-y-1">
                        <span className="text-muted-foreground font-medium">
                            Message:
                        </span>
                        <div className="p-3 rounded-md bg-muted font-medium text-foreground">
                            {error.msg}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-muted-foreground font-medium">
                            Location Path:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-md bg-muted font-mono">
                            {error.loc.length > 0 ? (
                                error.loc.map((segment, idx) => (
                                    <span
                                        key={String(idx)}
                                        className="flex items-center gap-1.5"
                                    >
                                        <Badge
                                            variant="secondary"
                                            className="px-1.5 py-0 text-[11px]"
                                        >
                                            {segment}
                                        </Badge>
                                        {idx < error.loc.length - 1 && (
                                            <span className="text-muted-foreground">
                                                &gt;
                                            </span>
                                        )}
                                    </span>
                                ))
                            ) : (
                                <span className="text-muted-foreground">
                                    Root location
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
