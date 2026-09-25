import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
    ApplicationLogResponseDto,
    ExportRequestLogsOptions,
    GetRequestLogsOptions,
    GetRequestLogTimelineOptions,
    RequestLogDetailsResponseDto,
    RequestLogResponsePaginatedDto,
    RequestLogTimelineResponseDto,
} from '@hitapi/types';
import { useExportCsv } from '@/hooks';
import { requestLogsApi } from '../api';
import { requestLogsKeys } from './request-logs.keys';

export function useRequestLogsQuery(options: Partial<GetRequestLogsOptions>) {
    return useQuery<RequestLogResponsePaginatedDto>({
        queryKey: requestLogsKeys.list(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await requestLogsApi.list(
                {
                    offset: 1,
                    limit: 20,
                    ...options,
                } as GetRequestLogsOptions,
                signal,
            );
            return {
                data: res.data ?? [],
                metadata: res.metadata ?? {
                    totalItems: 0,
                    totalPages: 1,
                    currentPage: 1,
                },
            };
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}

export function useRequestLogsTimelineQuery(
    options: Partial<GetRequestLogTimelineOptions>,
) {
    return useQuery<RequestLogTimelineResponseDto>({
        queryKey: requestLogsKeys.timeline(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await requestLogsApi.timeline(
                options as GetRequestLogTimelineOptions,
                signal,
            );
            return (
                res.data ?? {
                    timeWindows: [],
                    itemCounts: [],
                }
            );
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}

export function useRequestLogDetailsQuery(
    requestUuid?: string,
    appId?: string,
    timestamp?: string,
) {
    return useQuery<RequestLogDetailsResponseDto | null>({
        queryKey: requestLogsKeys.details(
            requestUuid ?? '',
            appId ?? '',
            timestamp,
        ),
        queryFn: async ({ signal }) => {
            if (!requestUuid || !appId) return null;
            const res = await requestLogsApi.getDetails(
                requestUuid,
                appId,
                timestamp,
                signal,
            );
            return res.data ?? null;
        },
        enabled: Boolean(requestUuid && appId),
    });
}

export function useApplicationLogsQuery(requestUuid?: string, appId?: string) {
    return useQuery<ApplicationLogResponseDto[]>({
        queryKey: requestLogsKeys.applicationLogs(
            requestUuid ?? '',
            appId ?? '',
        ),
        queryFn: async ({ signal }) => {
            if (!requestUuid || !appId) return [];
            const res = await requestLogsApi.getApplicationLogs(
                requestUuid,
                appId,
                signal,
            );
            return res.data ?? [];
        },
        enabled: Boolean(requestUuid && appId),
    });
}

export function useExportRequestLogs() {
    return useExportCsv<ExportRequestLogsOptions>({
        filenamePrefix: 'request-logs',
        getAppId: (params) => params.appId,
        fetcher: async (params) => {
            const csv = await requestLogsApi.export(params);
            if (typeof csv !== 'string')
                throw new Error('Invalid export response');
            return csv;
        },
    });
}
