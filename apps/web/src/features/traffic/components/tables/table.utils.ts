import {
    OrderDirection,
    type TrafficEndpointsTableResponseDto,
} from '@hitapi/types';

export type TrafficSortField =
    | 'path'
    | 'totalRequestCount'
    | 'clientErrorCount'
    | 'serverErrorCount'
    | 'errorRate'
    | 'dataTransferred';

export function sortTrafficEndpoints(
    endpoints: readonly TrafficEndpointsTableResponseDto[],
    sortBy: TrafficSortField,
    direction: OrderDirection,
): TrafficEndpointsTableResponseDto[] {
    return [...endpoints].sort((a, b) => {
        let aVal: string | number = a[sortBy];
        let bVal: string | number = b[sortBy];

        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = (bVal as string).toLowerCase();
        }

        if (aVal < bVal) return direction === OrderDirection.ASC ? -1 : 1;
        if (aVal > bVal) return direction === OrderDirection.ASC ? 1 : -1;
        return 0;
    });
}

export function getErrorRateBadgeClass(rate: number): string {
    if (rate > 5) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
    if (rate > 0) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    return 'text-muted-foreground';
}
