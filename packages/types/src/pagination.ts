export interface OffsetPaginationOptions {
    offset: number;
    limit: number;
}

export type QueryParams = Record<
    string,
    string | number | boolean | undefined | null
>;
