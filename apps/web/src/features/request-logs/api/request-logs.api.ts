import { api } from '@/lib/api/client';
import type {
    ApplicationLogResponseDto,
    CustomResponse,
    ExportRequestLogsOptions,
    GetRequestLogsOptions,
    GetRequestLogTimelineOptions,
    QueryParams,
    RequestLogDetailsResponseDto,
    RequestLogResponseDto,
    RequestLogTimelineResponseDto,
} from '@hitapi/types';

export type GetRequestLogsResponse = CustomResponse<RequestLogResponseDto[]>;
export type GetRequestLogTimelineResponse =
    CustomResponse<RequestLogTimelineResponseDto>;
export type GetRequestLogDetailsResponse =
    CustomResponse<RequestLogDetailsResponseDto>;
export type GetApplicationLogsResponse = CustomResponse<
    ApplicationLogResponseDto[]
>;

export const requestLogsApi = {
    list: (options: GetRequestLogsOptions, signal?: AbortSignal) =>
        api.get<GetRequestLogsResponse>(
            '/request-logs',
            options as unknown as QueryParams,
            signal,
        ),

    timeline: (options: GetRequestLogTimelineOptions, signal?: AbortSignal) =>
        api.get<GetRequestLogTimelineResponse>(
            '/request-logs/timeline',
            options as unknown as QueryParams,
            signal,
        ),

    export: (options: ExportRequestLogsOptions, signal?: AbortSignal) =>
        api.get<string>(
            '/request-logs/export',
            options as unknown as QueryParams,
            signal,
        ),

    getDetails: (
        requestUuid: string,
        appId: string,
        timestamp?: string,
        signal?: AbortSignal,
    ) =>
        api.get<GetRequestLogDetailsResponse>(
            `/request-logs/${requestUuid}`,
            { appId, timestamp },
            signal,
        ),

    getApplicationLogs: (
        requestUuid: string,
        appId: string,
        signal?: AbortSignal,
    ) =>
        api.get<GetApplicationLogsResponse>(
            `/request-logs/${requestUuid}/logs`,
            { appId },
            signal,
        ),
};
