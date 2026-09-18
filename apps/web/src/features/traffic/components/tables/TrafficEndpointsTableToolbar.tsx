import { Button } from '@/components/ui/button';
import { MethodFilterSelect, SearchInput } from '@/components/common';

export interface TrafficEndpointsTableToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedMethod: string;
    onMethodChange: (value: string) => void;
    totalCount: number;
    filteredCount: number;
    onResetFilters: () => void;
}

export function TrafficEndpointsTableToolbar({
    searchTerm,
    onSearchChange,
    selectedMethod,
    onMethodChange,
    totalCount,
    filteredCount,
    onResetFilters,
}: Readonly<TrafficEndpointsTableToolbarProps>) {
    const isFiltered = searchTerm !== '' || selectedMethod !== 'all';

    return (
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b bg-muted/10">
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
                <SearchInput
                    placeholder="Filter by endpoint path..."
                    value={searchTerm}
                    onChange={onSearchChange}
                    className="w-full sm:w-64"
                />

                <MethodFilterSelect
                    value={selectedMethod}
                    onChange={onMethodChange}
                    allLabel="All methods"
                    className="h-9 w-32"
                />

                {isFiltered ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onResetFilters}
                        className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                        Reset
                    </Button>
                ) : null}
            </div>

            <div className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                {isFiltered ? (
                    <span>
                        Showing <strong>{filteredCount}</strong> of {totalCount}{' '}
                        endpoints
                    </span>
                ) : (
                    <span>
                        <strong>{totalCount}</strong> endpoints total
                    </span>
                )}
            </div>
        </div>
    );
}
