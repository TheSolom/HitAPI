import type { ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from './SearchInput';
import { cn } from '@/lib/utils';

export interface TableSearchToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    debounceMs?: number;
    hasActiveFilters?: boolean;
    onResetFilters?: () => void;
    resetLabel?: string;
    children?: ReactNode;
    totalCount?: number;
    filteredCount?: number;
    entityName?: string;
    className?: string;
}

export function TableSearchToolbar({
    search,
    onSearchChange,
    searchPlaceholder,
    debounceMs,
    hasActiveFilters,
    onResetFilters,
    resetLabel = 'Reset',
    children,
    totalCount,
    filteredCount,
    entityName = 'items',
    className,
}: Readonly<TableSearchToolbarProps>) {
    const isFiltered = hasActiveFilters ?? search !== '';

    return (
        <div
            className={cn(
                'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
                className,
            )}
        >
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
                <SearchInput
                    value={search}
                    onChange={onSearchChange}
                    placeholder={searchPlaceholder}
                    debounceMs={debounceMs}
                />

                {children}

                {isFiltered && onResetFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onResetFilters}
                        className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                        title="Reset all filters"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>{resetLabel}</span>
                    </Button>
                )}
            </div>

            {totalCount !== undefined && (
                <div className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                    {filteredCount !== undefined &&
                    filteredCount !== totalCount ? (
                        <span>
                            Showing <strong>{filteredCount}</strong> of{' '}
                            {totalCount} {entityName}
                        </span>
                    ) : (
                        <span>
                            <strong>{totalCount}</strong> {entityName} total
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
