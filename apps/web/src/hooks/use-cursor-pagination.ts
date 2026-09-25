import { useCallback, useState } from 'react';

export interface UseCursorPaginationOptions {
    initialPage?: number;
}

export interface UseCursorPaginationReturn {
    cursor: string | null;
    currentPage: number;
    hasPrevPage: boolean;
    goToNextPage: (nextCursor?: string | null) => void;
    goToPrevPage: () => void;
    resetPagination: () => void;
}

/**
 * Enterprise reusable hook for keyset / cursor-based pagination state management.
 * Maintains an internal cursor stack for zero-latency backward navigation and
 * provides standard page indicators and controls.
 */
export function useCursorPagination({
    initialPage = 1,
}: UseCursorPaginationOptions = {}): UseCursorPaginationReturn {
    const [cursor, setCursor] = useState<string | null>(null);
    const [cursorStack, setCursorStack] = useState<(string | null)[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(initialPage);

    const resetPagination = useCallback(() => {
        setCursor(null);
        setCursorStack([]);
        setCurrentPage(initialPage);
    }, [initialPage]);

    const hasPrevPage = cursorStack.length > 0 || currentPage > 1;

    const goToPrevPage = useCallback(() => {
        if (cursorStack.length > 0) {
            const previousCursor = cursorStack[cursorStack.length - 1];
            setCursorStack((prev) => prev.slice(0, -1));
            setCursor(previousCursor);
            setCurrentPage((prev) => Math.max(1, prev - 1));
        } else {
            setCursor(null);
            setCurrentPage((prev) => Math.max(1, prev - 1));
        }
    }, [cursorStack]);

    const goToNextPage = useCallback(
        (nextCursor?: string | null) => {
            setCursorStack((prev) => [...prev, cursor]);
            setCursor(nextCursor ?? null);
            setCurrentPage((prev) => prev + 1);
        },
        [cursor],
    );

    return {
        cursor,
        currentPage,
        hasPrevPage,
        goToNextPage,
        goToPrevPage,
        resetPagination,
    };
}
