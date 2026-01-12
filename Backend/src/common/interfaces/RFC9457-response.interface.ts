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
