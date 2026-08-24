import type { RestfulMethod } from '@hitapi/shared/enums';

export interface EndpointResponseDto {
    id: string;
    method: RestfulMethod;
    path: string;
    summary: string | null;
    description: string | null;
    targetResponseTimeMs: number | null;
    excluded: boolean;
}

export interface EndpointConfigResponseDto {
    excluded: boolean;
    targetResponseTimeMs: number | null;
}

export interface CreateEndpointPayload {
    method: RestfulMethod;
    path: string;
    summary?: string;
    description?: string;
    targetResponseTimeMs?: number;
    excluded?: boolean;
}

export interface UpdateEndpointConfigPayload {
    method: RestfulMethod;
    path: string;
    excluded?: boolean;
    targetResponseTimeMs?: number;
}

export interface UpdateEndpointErrorConfigPayload {
    method: RestfulMethod;
    path: string;
    statusCode: number;
    expected: boolean;
}

export interface GetEndpointsQuery {
    search?: string;
}

export interface GetEndpointConfigQuery {
    method: RestfulMethod;
    path: string;
}
