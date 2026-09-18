import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
    DataTransferredChartResponseDto,
    GetTrafficOptions,
    RequestsChartResponseDto,
    RequestsPerMinuteChartResponseDto,
    TrafficEndpointsTableResponseDto,
    TrafficMetricsResponseDto,
} from '@hitapi/types';
import { trafficApi } from '../api';
import { trafficKeys } from './traffic.keys';

export function useTrafficMetricsQuery(options: Partial<GetTrafficOptions>) {
    return useQuery<TrafficMetricsResponseDto | null>({
        queryKey: trafficKeys.metrics(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await trafficApi.metrics(
                options as GetTrafficOptions,
                signal,
            );
            return res.data ?? null;
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}

export function useRequestsChartQuery(options: Partial<GetTrafficOptions>) {
    return useQuery<RequestsChartResponseDto[]>({
        queryKey: trafficKeys.requestsChart(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await trafficApi.requestsChart(
                options as GetTrafficOptions,
                signal,
            );
            return res.data ?? [];
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}

export function useRequestsPerMinuteChartQuery(
    options: Partial<GetTrafficOptions>,
) {
    return useQuery<RequestsPerMinuteChartResponseDto | null>({
        queryKey: trafficKeys.requestsPerMinuteChart(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await trafficApi.requestsPerMinuteChart(
                options as GetTrafficOptions,
                signal,
            );
            return res.data ?? null;
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}

export function useDataTransferredChartQuery(
    options: Partial<GetTrafficOptions>,
) {
    return useQuery<DataTransferredChartResponseDto | null>({
        queryKey: trafficKeys.dataTransferredChart(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await trafficApi.dataTransferredChart(
                options as GetTrafficOptions,
                signal,
            );
            return res.data ?? null;
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}

export function useTrafficEndpointsTableQuery(
    options: Partial<GetTrafficOptions>,
) {
    return useQuery<TrafficEndpointsTableResponseDto[]>({
        queryKey: trafficKeys.endpointsTable(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await trafficApi.endpointsTable(
                options as GetTrafficOptions,
                signal,
            );
            return res.data ?? [];
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}
