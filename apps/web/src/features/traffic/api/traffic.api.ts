import { api } from '@/lib/api/client';
import type {
    CustomResponse,
    DataTransferredChartResponseDto,
    GetTrafficOptions,
    QueryParams,
    RequestsChartResponseDto,
    RequestsPerMinuteChartResponseDto,
    TrafficEndpointsTableResponseDto,
    TrafficMetricsResponseDto,
} from '@hitapi/types';

export type GetTrafficMetricsResponse =
    CustomResponse<TrafficMetricsResponseDto>;
export type GetRequestsChartResponse = CustomResponse<
    RequestsChartResponseDto[]
>;
export type GetRequestsPerMinuteChartResponse =
    CustomResponse<RequestsPerMinuteChartResponseDto>;
export type GetDataTransferredChartResponse =
    CustomResponse<DataTransferredChartResponseDto>;
export type GetTrafficEndpointsTableResponse = CustomResponse<
    TrafficEndpointsTableResponseDto[]
>;

export const trafficApi = {
    metrics: (options: GetTrafficOptions, signal?: AbortSignal) =>
        api.get<GetTrafficMetricsResponse>(
            '/traffic/metrics',
            options as unknown as QueryParams,
            signal,
        ),

    requestsChart: (options: GetTrafficOptions, signal?: AbortSignal) =>
        api.get<GetRequestsChartResponse>(
            '/traffic/requests-chart',
            options as unknown as QueryParams,
            signal,
        ),

    requestsPerMinuteChart: (
        options: GetTrafficOptions,
        signal?: AbortSignal,
    ) =>
        api.get<GetRequestsPerMinuteChartResponse>(
            '/traffic/requests-per-minute-chart',
            options as unknown as QueryParams,
            signal,
        ),

    dataTransferredChart: (options: GetTrafficOptions, signal?: AbortSignal) =>
        api.get<GetDataTransferredChartResponse>(
            '/traffic/data-transferred-chart',
            options as unknown as QueryParams,
            signal,
        ),

    endpointsTable: (options: GetTrafficOptions, signal?: AbortSignal) =>
        api.get<GetTrafficEndpointsTableResponse>(
            '/traffic/endpoints-table',
            options as unknown as QueryParams,
            signal,
        ),
};
