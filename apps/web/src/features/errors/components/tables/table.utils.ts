import { RestfulMethod } from '@hitapi/shared/enums';
import { OrderDirection } from '@hitapi/types';

export type ErrorSortField =
    'statusCode' | 'requestCount' | 'affectedConsumers' | 'path';

export function getAriaSort(
    column: ErrorSortField,
    sortBy: ErrorSortField,
    order: OrderDirection,
) {
    if (sortBy !== column) return 'none';
    return order === OrderDirection.ASC ? 'ascending' : 'descending';
}

export function getMethodBadgeClass(method: RestfulMethod): string {
    switch (method) {
        case RestfulMethod.GET:
            return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
        case RestfulMethod.POST:
            return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        case RestfulMethod.PUT:
            return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        case RestfulMethod.PATCH:
            return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
        case RestfulMethod.DELETE:
            return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

export function getStatusCodeBadgeClass(statusCode: number): string {
    if (statusCode >= 500) {
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }
    if (statusCode >= 400) {
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
    return 'bg-muted text-muted-foreground border-border';
}
