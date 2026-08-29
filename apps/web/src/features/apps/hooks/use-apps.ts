import { useQuery } from '@tanstack/react-query';
import {
    appsApi,
    type GetAppMetricsQuery,
    type GetAppMetricsResponse,
    type GetAppsQuery,
    type GetAppsResponse,
    type GetAppResponse,
} from '../api';
import { appKeys } from './apps.keys';

export function useAppsQuery(filters?: Partial<GetAppsQuery>) {
    const teamId = filters?.teamId;
    return useQuery<GetAppsResponse>({
        queryKey: appKeys.list(filters ?? {}),
        queryFn: ({ signal }) => {
            if (!teamId) {
                throw new Error('teamId is required to fetch apps');
            }
            return appsApi.list({ teamId }, signal);
        },
        enabled: Boolean(teamId),
    });
}

export function useAppQuery(appId: string) {
    return useQuery<GetAppResponse>({
        queryKey: appKeys.detail(appId),
        queryFn: ({ signal }) => appsApi.get(appId, signal),
        enabled: Boolean(appId),
    });
}

export function useAppMetricsQuery(
    appId: string,
    filters: GetAppMetricsQuery = {},
) {
    return useQuery<GetAppMetricsResponse>({
        queryKey: appKeys.metrics(appId, filters),
        queryFn: ({ signal }) => appsApi.metrics(appId, filters, signal),
        enabled: Boolean(appId),
    });
}
