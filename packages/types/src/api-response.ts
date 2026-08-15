export interface MetadataResponse {
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export interface CustomResponse<T = unknown> {
    message: string;
    metadata?: MetadataResponse;
    data?: T;
}

export type PaginatedResponse<T> = CustomResponse<T>;

export interface MessageResponse {
    message: string;
}

export interface ValidationErrorDetail {
    field: string;
    detail: string;
}

export interface RFC9457Response {
    title: string;
    status: number;
    detail: string;
    instance: string;
    traceId: string;
    errors?: Array<ValidationErrorDetail>;
}
