import { Network } from 'lucide-react';

export interface TrafficEndpointsEmptyStateProps {
    readonly isFiltered?: boolean;
    readonly onResetFilters?: () => void;
}

export function TrafficEndpointsEmptyState({
    isFiltered,
    onResetFilters,
}: TrafficEndpointsEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-muted-foreground">
            <Network className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="font-medium text-foreground text-sm">
                {isFiltered
                    ? 'No matching endpoints'
                    : 'No endpoint traffic data'}
            </p>
            <p className="text-[11px] mt-1 max-w-sm">
                {isFiltered
                    ? 'No endpoints match your current filter criteria. Try clearing your search or method filters.'
                    : 'Endpoint traffic and error metrics will appear as API requests are processed.'}
            </p>
            {isFiltered && onResetFilters && (
                <button
                    type="button"
                    onClick={onResetFilters}
                    className="mt-3 text-xs font-medium text-primary hover:underline"
                >
                    Reset filters
                </button>
            )}
        </div>
    );
}
