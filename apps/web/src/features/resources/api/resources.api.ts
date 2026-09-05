import { api } from '@/lib/api/client';
import type {
    CpuMemoryChartResponseDto,
    CustomResponse,
    GetCpuMemoryChartOptions,
    QueryParams,
    ResourceMetricsResponseDto,
} from '@hitapi/types';

export type GetResourceMetricsResponse =
    CustomResponse<ResourceMetricsResponseDto>;
export type GetCpuMemoryChartResponse =
    CustomResponse<CpuMemoryChartResponseDto>;

export const resourcesApi = {
    metrics: (appId: string, signal?: AbortSignal) =>
        api.get<GetResourceMetricsResponse>(
            '/resources/metrics',
            { appId },
            signal,
        ),

    cpuMemoryChart: (options: GetCpuMemoryChartOptions, signal?: AbortSignal) =>
        api.get<GetCpuMemoryChartResponse>(
            '/resources/cpu-memory-chart',
            options as unknown as QueryParams,
            signal,
        ),
};
