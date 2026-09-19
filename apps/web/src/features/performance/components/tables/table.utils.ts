import {
    OrderDirection,
    type PerformanceEndpointsTableResponseDto,
} from '@hitapi/types';

export type PerformanceSortField =
    | 'path'
    | 'totalRequestCount'
    | 'responseTimeP50'
    | 'responseTimeP75'
    | 'responseTimeP95'
    | 'apdexScore';

function comparePerformanceField(
    a: PerformanceEndpointsTableResponseDto,
    b: PerformanceEndpointsTableResponseDto,
    field: PerformanceSortField,
): number {
    switch (field) {
        case 'path':
            return a.path.localeCompare(b.path);
        case 'totalRequestCount':
            return a.totalRequestCount - b.totalRequestCount;
        case 'responseTimeP50':
            return a.responseTimeP50 - b.responseTimeP50;
        case 'responseTimeP75':
            return a.responseTimeP75 - b.responseTimeP75;
        case 'responseTimeP95':
            return a.responseTimeP95 - b.responseTimeP95;
        case 'apdexScore':
            return a.apdexScore - b.apdexScore;
    }
}

export function sortPerformanceEndpoints(
    endpoints: PerformanceEndpointsTableResponseDto[],
    field: PerformanceSortField,
    direction: OrderDirection,
): PerformanceEndpointsTableResponseDto[] {
    return [...endpoints].sort((a, b) => {
        const comp = comparePerformanceField(a, b, field);
        return direction === OrderDirection.DESC ? -comp : comp;
    });
}
