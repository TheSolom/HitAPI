export function buildMetadata(
    offset: number,
    limit: number,
    totalItems: number,
) {
    return {
        currentPage: offset,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
    };
}
