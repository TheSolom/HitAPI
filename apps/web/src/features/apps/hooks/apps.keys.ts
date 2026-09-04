import type { GetAppMetricsQuery, GetAppsQuery } from '../api';

export const appKeys = {
    all: ['apps'] as const,
    lists: () => [...appKeys.all, 'list'] as const,
    list: (filters: GetAppsQuery = {}) =>
        [...appKeys.lists(), filters] as const,
    details: () => [...appKeys.all, 'detail'] as const,
    detail: (appId: string) => [...appKeys.details(), appId] as const,
    metrics: (appId: string, filters: GetAppMetricsQuery = {}) =>
        [...appKeys.detail(appId), 'metrics', filters] as const,
};
