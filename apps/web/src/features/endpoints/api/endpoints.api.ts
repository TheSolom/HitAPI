import { api } from '@/lib/api/client';
import type {
    CustomResponse,
    EndpointConfigResponseDto,
    EndpointResponseDto,
    GetEndpointConfigQuery,
    GetEndpointsQuery,
    UpdateEndpointConfigPayload,
    UpdateEndpointErrorConfigPayload,
} from '@hitapi/types';

export type GetEndpointsResponse = CustomResponse<EndpointResponseDto[]>;
export type GetEndpointResponse = CustomResponse<EndpointResponseDto>;
export type GetEndpointConfigResponse =
    CustomResponse<EndpointConfigResponseDto>;

export const endpointsApi = {
    list: (
        appId: string,
        params?: GetEndpointsQuery,
        signal?: AbortSignal,
    ) =>
        api.get<GetEndpointsResponse>(
            `/apps/${appId}/endpoints`,
            params?.search ? { search: params.search } : undefined,
            signal,
        ),

    get: (appId: string, endpointId: string, signal?: AbortSignal) =>
        api.get<GetEndpointResponse>(
            `/apps/${appId}/endpoints/${endpointId}`,
            undefined,
            signal,
        ),

    getConfig: (
        appId: string,
        params: GetEndpointConfigQuery,
        signal?: AbortSignal,
    ) =>
        api.get<GetEndpointConfigResponse>(
            `/apps/${appId}/endpoints/config`,
            { method: params.method, path: params.path },
            signal,
        ),

    updateConfig: (appId: string, payload: UpdateEndpointConfigPayload) =>
        api.put<undefined>(`/apps/${appId}/endpoints/config`, payload),

    updateErrorConfig: (
        appId: string,
        payload: UpdateEndpointErrorConfigPayload,
    ) => api.put<undefined>(`/apps/${appId}/endpoints/errors/config`, payload),
};
