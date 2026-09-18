import { OrderDirection } from '@hitapi/types';

/**
 * Returns the ARIA sort attribute value for a table column header.
 *
 * @param column   - The column being evaluated.
 * @param sortBy   - The currently active sort column.
 * @param order    - The currently active sort direction.
 */
export function getAriaSort<F>(
    column: F,
    sortBy: F,
    order: OrderDirection,
): 'none' | 'ascending' | 'descending' {
    if (sortBy !== column) return 'none';
    return order === OrderDirection.ASC ? 'ascending' : 'descending';
}
