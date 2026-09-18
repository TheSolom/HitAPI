import { useCallback, useMemo, useState } from 'react';

export interface BasePaginationState {
    currentPage: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    goToPage: (page: number) => void;
    goToNextPage: () => void;
    goToPrevPage: () => void;
    resetPage: () => void;
}

export interface ClientPaginationState<T> extends BasePaginationState {
    pageSize: number;
    totalPages: number;
    totalItems: number;
    paginatedItems: readonly T[];
}

export interface ServerPaginationState extends BasePaginationState {
    pageSize: number;
    totalPages?: number;
}

export function usePagination<T>(
    items: readonly T[],
    pageSize?: number,
): ClientPaginationState<T>;
export function usePagination(
    items: null,
    pageSize?: number,
    totalPages?: number,
): ServerPaginationState;
export function usePagination<T>(
    items: readonly T[] | null,
    pageSize = 15,
    serverTotalPages?: number,
): ClientPaginationState<T> | ServerPaginationState {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = useMemo(() => {
        if (items === null) return serverTotalPages;
        return Math.max(1, Math.ceil(items.length / pageSize));
    }, [items, pageSize, serverTotalPages]);

    const paginatedItems = useMemo<readonly T[]>(() => {
        if (items === null) return [];
        const start = (currentPage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [items, currentPage, pageSize]);

    const hasPrevPage = currentPage > 1;
    const hasNextPage =
        totalPages !== undefined ? currentPage < totalPages : true;

    const goToPage = useCallback(
        (page: number) => {
            const max = totalPages ?? Number.POSITIVE_INFINITY;
            setCurrentPage(Math.max(1, Math.min(page, max)));
        },
        [totalPages],
    );

    const goToNextPage = useCallback(() => {
        setCurrentPage((prev) => {
            if (totalPages !== undefined && prev >= totalPages) return prev;
            return prev + 1;
        });
    }, [totalPages]);

    const goToPrevPage = useCallback(() => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
    }, []);

    const resetPage = useCallback(() => {
        setCurrentPage(1);
    }, []);

    const baseState: BasePaginationState = {
        currentPage,
        hasPrevPage,
        hasNextPage,
        goToPage,
        goToNextPage,
        goToPrevPage,
        resetPage,
    };

    if (items === null) {
        return {
            ...baseState,
            pageSize,
            totalPages,
        };
    }

    return {
        ...baseState,
        pageSize,
        totalPages: totalPages ?? 1,
        totalItems: items.length,
        paginatedItems,
    };
}
