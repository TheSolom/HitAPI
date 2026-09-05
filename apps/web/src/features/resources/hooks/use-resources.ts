import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
    CpuMemoryChartResponseDto,
    GetCpuMemoryChartOptions,
    ResourceMetricsResponseDto,
} from '@hitapi/types';
import { resourcesApi } from '../api';
import { resourceKeys } from './resources.keys';

export function useResourceMetricsQuery(appId?: string) {
    return useQuery<ResourceMetricsResponseDto>({
        queryKey: resourceKeys.metrics(appId ?? ''),
        queryFn: async ({ signal }) => {
            if (!appId) {
                throw new Error('appId is required to fetch resource metrics');
            }
            const res = await resourcesApi.metrics(appId, signal);
            if (!res.data) {
                throw new Error('Failed to load resource metrics');
            }
            return res.data;
        },
        enabled: Boolean(appId),
    });
}

export function useCpuMemoryChartQuery(
    options: Partial<GetCpuMemoryChartOptions>,
) {
    return useQuery<CpuMemoryChartResponseDto>({
        queryKey: resourceKeys.chart(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required to fetch resource chart');
            }
            const res = await resourcesApi.cpuMemoryChart(
                options as GetCpuMemoryChartOptions,
                signal,
            );
            if (!res.data) {
                throw new Error('Failed to load resource chart');
            }
            return res.data;
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}
