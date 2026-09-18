import {
    type DataTransferredChartResponseDto,
    type RequestsChartResponseDto,
    type RequestsPerMinuteChartResponseDto,
    ResponseStatus,
} from '@hitapi/types';
import { formatTimeWindow } from '../../utils';

export interface RequestsChartEntry {
    timeWindow: string;
    formattedTime: string;
    successful: number;
    clientError: number;
    serverError: number;
    total: number;
    statusCodes: Record<number, number>;
}

export function transformRequestsChartData(
    datasets: readonly RequestsChartResponseDto[] = [],
): RequestsChartEntry[] {
    const timeMap = new Map<string, RequestsChartEntry>();

    for (const dataset of datasets) {
        const isClientError =
            dataset.responseStatus === ResponseStatus.CLIENT_ERROR;
        const isServerError =
            dataset.responseStatus === ResponseStatus.SERVER_ERROR;

        for (let i = 0; i < dataset.timeWindows.length; i++) {
            const tw = dataset.timeWindows[i];
            const count = dataset.requestCounts[i] ?? 0;
            const codeCounts = dataset.statusCodeCounts[i] ?? [];

            if (!timeMap.has(tw)) {
                timeMap.set(tw, {
                    timeWindow: tw,
                    formattedTime: formatTimeWindow(tw),
                    successful: 0,
                    clientError: 0,
                    serverError: 0,
                    total: 0,
                    statusCodes: {},
                });
            }

            const entry = timeMap.get(tw);
            if (entry) {
                if (isClientError) {
                    entry.clientError += count;
                } else if (isServerError) {
                    entry.serverError += count;
                } else {
                    entry.successful += count;
                }
                entry.total += count;

                for (const [statusCode, codeCount] of codeCounts) {
                    entry.statusCodes[statusCode] =
                        (entry.statusCodes[statusCode] ?? 0) + codeCount;
                }
            }
        }
    }

    return Array.from(timeMap.values()).sort(
        (a, b) =>
            new Date(a.timeWindow).getTime() - new Date(b.timeWindow).getTime(),
    );
}

export interface RequestsPerMinuteChartEntry {
    timeWindow: string;
    formattedTime: string;
    rpm: number;
}

export function transformRpmChartData(
    data: RequestsPerMinuteChartResponseDto | null | undefined,
): RequestsPerMinuteChartEntry[] {
    if (!data || data.timeWindows.length === 0) {
        return [];
    }

    return data.timeWindows.map((tw, idx) => ({
        timeWindow: tw,
        formattedTime: formatTimeWindow(tw),
        rpm: data.requestsPerMinute[idx] ?? 0,
    }));
}

export interface DataTransferredChartEntry {
    timeWindow: string;
    formattedTime: string;
    requestBytes: number;
    responseBytes: number;
    totalBytes: number;
}

export function transformDataTransferredChartData(
    data: DataTransferredChartResponseDto | null | undefined,
): DataTransferredChartEntry[] {
    if (!data || data.timeWindows.length === 0) {
        return [];
    }

    return data.timeWindows.map((tw, idx) => {
        const req = data.requestSizeSums[idx] ?? 0;
        const res = data.responseSizeSums[idx] ?? 0;
        return {
            timeWindow: tw,
            formattedTime: formatTimeWindow(tw),
            requestBytes: req,
            responseBytes: res,
            totalBytes: req + res,
        };
    });
}
