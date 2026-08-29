import { api } from '@/lib/api/client';
import type {
    AppMetricsDto,
    AppResponseDto,
    CreateAppPayload,
    CustomResponse,
    UpdateAppPayload,
} from '@hitapi/types';

export type GetAppsResponse = CustomResponse<AppResponseDto[]>;
export type GetAppResponse = CustomResponse<AppResponseDto>;
export type GetAppMetricsResponse = CustomResponse<AppMetricsDto>;

export interface GetAppsQuery {
    teamId?: string;
}

export interface GetAppMetricsQuery {
    period?: string;
}

export const appsApi = {
    list: (query: GetAppsQuery = {}, signal?: AbortSignal) =>
        api.get<GetAppsResponse>(
            '/apps',
            query.teamId ? { teamId: query.teamId } : undefined,
            signal,
        ),

    get: (appId: string, signal?: AbortSignal) =>
        api.get<GetAppResponse>(`/apps/${appId}`, undefined, signal),

    create: (payload: CreateAppPayload) =>
        api.post<GetAppResponse>('/apps', payload),

    update: (appId: string, payload: UpdateAppPayload) =>
        api.patch<GetAppResponse>(`/apps/${appId}`, payload),

    remove: (appId: string) => api.delete<undefined>(`/apps/${appId}`),

    metrics: (
        appId: string,
        query: GetAppMetricsQuery = {},
        signal?: AbortSignal,
    ) =>
        api.get<GetAppMetricsResponse>(
            `/apps/${appId}/metrics`,
            { ...query },
            signal,
        ),
};
