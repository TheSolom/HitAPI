import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
    ApdexScoreChartResponseDto,
    GetPerformanceOptions,
    PerformanceEndpointsTableResponseDto,
    PerformanceMetricsResponseDto,
    ResponseTimeChartResponseDto,
} from '@hitapi/types';
import { performanceApi } from '../api';
import { performanceKeys } from './performance.keys';

export function usePerformanceMetricsQuery(
    options: Partial<GetPerformanceOptions>,
) {
    return useQuery<PerformanceMetricsResponseDto | null>({
        queryKey: performanceKeys.metrics(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) throw new Error('appId is required');
            const res = await performanceApi.metrics(
                options as GetPerformanceOptions,
                signal,
            );
            return res.data ?? null;
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}

export function useApdexScoreChartQuery(
    options: Partial<GetPerformanceOptions>,
) {
    return useQuery<ApdexScoreChartResponseDto | null>({
        queryKey: performanceKeys.apdexScoreChart(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) throw new Error('appId is required');
            const res = await performanceApi.apdexScoreChart(
                options as GetPerformanceOptions,
                signal,
            );
            return res.data ?? null;
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}

export function useResponseTimeChartQuery(
    options: Partial<GetPerformanceOptions>,
) {
    return useQuery<ResponseTimeChartResponseDto | null>({
        queryKey: performanceKeys.responseTimeChart(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) throw new Error('appId is required');
            const res = await performanceApi.responseTimeChart(
                options as GetPerformanceOptions,
                signal,
            );
            return res.data ?? null;
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}

export function usePerformanceEndpointsTableQuery(
    options: Partial<GetPerformanceOptions>,
) {
    return useQuery<PerformanceEndpointsTableResponseDto[]>({
        queryKey: performanceKeys.endpointsTable(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) throw new Error('appId is required');
            const res = await performanceApi.endpointsTable(
                options as GetPerformanceOptions,
                signal,
            );
            return res.data ?? [];
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}
