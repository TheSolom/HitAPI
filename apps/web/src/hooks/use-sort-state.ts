import { useCallback, useState } from 'react';
import { OrderDirection } from '@hitapi/types';

export interface SortState<F extends string> {
    sortBy: F;
    order: OrderDirection;
    handleSort: (column: F) => void;
}

/**
 * Generic sort state hook.
 *
 * @param initialField     - The default active sort column.
 * @param initialDirection - The default sort direction (defaults to DESC).
 */
export function useSortState<F extends string>(
    initialField: F,
    initialDirection: OrderDirection = OrderDirection.DESC,
): SortState<F> {
    const [sortBy, setSortBy] = useState<F>(initialField);
    const [order, setOrder] = useState<OrderDirection>(initialDirection);

    const handleSort = useCallback(
        (column: F) => {
            if (sortBy === column) {
                setOrder((prev) =>
                    prev === OrderDirection.ASC
                        ? OrderDirection.DESC
                        : OrderDirection.ASC,
                );
            } else {
                setSortBy(column);
                setOrder(OrderDirection.DESC);
            }
        },
        [sortBy],
    );

    return { sortBy, order, handleSort };
}
