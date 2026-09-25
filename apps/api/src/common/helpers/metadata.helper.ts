export function buildMetadata(
    offset: number,
    limit: number,
    totalItems: number,
    extra?: {
        nextCursor?: string | null;
        prevCursor?: string | null;
        hasNextPage?: boolean;
        hasPrevPage?: boolean;
    },
) {
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    return {
        currentPage: offset,
        totalPages,
        totalItems,
        nextCursor: extra?.nextCursor ?? null,
        prevCursor: extra?.prevCursor ?? null,
        hasNextPage: extra?.hasNextPage ?? offset < totalPages,
        hasPrevPage: extra?.hasPrevPage ?? offset > 1,
    };
}
