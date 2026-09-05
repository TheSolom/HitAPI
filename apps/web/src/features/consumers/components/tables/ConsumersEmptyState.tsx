import { RotateCcw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ConsumersEmptyStateProps {
    readonly hasActiveFilters: boolean;
    readonly onResetFilters: () => void;
}

export function ConsumersEmptyState({
    hasActiveFilters,
    onResetFilters,
}: ConsumersEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
                No consumers found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                {hasActiveFilters
                    ? 'No consumers match your active filters. Try adjusting your search query, group filter, or new client toggle.'
                    : 'No consumers reported traffic in this period yet.'}
            </p>
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-xs gap-1.5"
                    onClick={onResetFilters}
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset filters</span>
                </Button>
            )}
        </div>
    );
}
