import type { LucideIcon } from 'lucide-react';
import { Inbox, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    action?: ReactNode;
    isFiltered?: boolean;
    onResetFilters?: () => void;
    resetLabel?: string;
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon: Icon = Inbox,
    action,
    isFiltered,
    onResetFilters,
    resetLabel = 'Reset filters',
    className,
}: Readonly<EmptyStateProps>) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-muted/20 p-8 text-center',
                className,
            )}
        >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                <Icon
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                />
            </span>
            <div>
                <p className="font-medium text-foreground">{title}</p>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            {action ??
                (isFiltered && onResetFilters ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onResetFilters}
                        className="gap-1.5 text-xs"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {resetLabel}
                    </Button>
                ) : null)}
        </div>
    );
}
