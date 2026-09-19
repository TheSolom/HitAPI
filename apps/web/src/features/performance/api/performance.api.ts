import { api } from '@/lib/api/client';
import type {
    ApdexScoreChartResponseDto,
    CustomResponse,
    GetPerformanceOptions,
    PerformanceEndpointsTableResponseDto,
    PerformanceMetricsResponseDto,
    QueryParams,
    ResponseTimeChartResponseDto,
} from '@hitapi/types';

export type GetPerformanceMetricsResponse =
    CustomResponse<PerformanceMetricsResponseDto>;
export type GetApdexScoreChartResponse =
    CustomResponse<ApdexScoreChartResponseDto>;
export type GetResponseTimeChartResponse =
    CustomResponse<ResponseTimeChartResponseDto>;
export type GetPerformanceEndpointsTableResponse = CustomResponse<
    PerformanceEndpointsTableResponseDto[]
>;

export const performanceApi = {
    metrics: (options: GetPerformanceOptions, signal?: AbortSignal) =>
        api.get<GetPerformanceMetricsResponse>(
            '/performance/metrics',
            options as unknown as QueryParams,
            signal,
        ),

    apdexScoreChart: (options: GetPerformanceOptions, signal?: AbortSignal) =>
        api.get<GetApdexScoreChartResponse>(
            '/performance/apdex-score-chart',
            options as unknown as QueryParams,
            signal,
        ),

    responseTimeChart: (options: GetPerformanceOptions, signal?: AbortSignal) =>
        api.get<GetResponseTimeChartResponse>(
            '/performance/response-time-chart',
            options as unknown as QueryParams,
            signal,
        ),

    endpointsTable: (options: GetPerformanceOptions, signal?: AbortSignal) =>
        api.get<GetPerformanceEndpointsTableResponse>(
            '/performance/endpoints-table',
            options as unknown as QueryParams,
            signal,
        ),
};
