import { OrderDirection } from '@hitapi/types';

export type SortField = 'name' | 'requests' | 'errorRate' | 'lastRequest';

export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleTimeString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getAriaSort(
    column: SortField,
    sortBy: SortField,
    order: OrderDirection,
) {
    if (sortBy !== column) return 'none';
    return order === OrderDirection.ASC ? 'ascending' : 'descending';
}
