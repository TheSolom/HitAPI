import type { GetEndpointConfigQuery, GetEndpointsQuery } from '@hitapi/types';

export const endpointKeys = {
    all: ['endpoints'] as const,
    lists: () => [...endpointKeys.all, 'list'] as const,
    list: (appId: string, params?: GetEndpointsQuery) =>
        [...endpointKeys.lists(), appId, params] as const,
    details: () => [...endpointKeys.all, 'detail'] as const,
    detail: (appId: string, endpointId: string) =>
        [...endpointKeys.details(), appId, endpointId] as const,
    configs: () => [...endpointKeys.all, 'config'] as const,
    config: (appId: string, params: GetEndpointConfigQuery) =>
        [...endpointKeys.configs(), appId, params] as const,
};
