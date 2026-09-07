import { format, parseISO } from 'date-fns';
import {
    ErrorType,
    type ErrorRatesChartResponseDto,
    type ErrorsByConsumerChartResponseDto,
    type ErrorsChartResponseDto,
} from '@hitapi/types';

export interface ErrorTimelineEntry {
    rawTime: string;
    formattedTime: string;
    clientErrors: number;
    serverErrors: number;
    totalErrors: number;
}

export interface ErrorRateTimelineEntry {
    rawTime: string;
    formattedTime: string;
    clientErrorRate: number;
    serverErrorRate: number;
}

export interface ErrorConsumerEntry {
    consumerId: number;
    consumerName: string;
    requestCount: number;
}

export function formatChartTime(isoString: string): string {
    try {
        const date = parseISO(isoString);
        return format(date, 'MMM d, HH:mm');
    } catch {
        return isoString;
    }
}

export function transformErrorsChartData(
    data?: ErrorsChartResponseDto[],
): ErrorTimelineEntry[] {
    if (!data || data.length === 0) return [];

    const timeMap = new Map<
        string,
        { clientErrors: number; serverErrors: number }
    >();

    for (const item of data) {
        const isClient = item.errorType === ErrorType.CLIENT_ERROR;
        item.timeWindows.forEach((tw, index) => {
            const count = item.requestCounts[index] ?? 0;
            const current = timeMap.get(tw) ?? {
                clientErrors: 0,
                serverErrors: 0,
            };
            if (isClient) {
                current.clientErrors += count;
            } else {
                current.serverErrors += count;
            }
            timeMap.set(tw, current);
        });
    }

    const sortedTimes = Array.from(timeMap.keys()).sort((a, b) =>
        a.localeCompare(b),
    );

    return sortedTimes.map((tw) => {
        const entry = timeMap.get(tw) ?? {
            clientErrors: 0,
            serverErrors: 0,
        };
        return {
            rawTime: tw,
            formattedTime: formatChartTime(tw),
            clientErrors: entry.clientErrors,
            serverErrors: entry.serverErrors,
            totalErrors: entry.clientErrors + entry.serverErrors,
        };
    });
}

export function transformErrorRatesChartData(
    data?: ErrorRatesChartResponseDto[],
): ErrorRateTimelineEntry[] {
    if (!data || data.length === 0) return [];

    const timeMap = new Map<
        string,
        { clientErrorRate: number; serverErrorRate: number }
    >();

    for (const item of data) {
        const isClient = item.errorType === ErrorType.CLIENT_ERROR;
        item.timeWindows.forEach((tw, index) => {
            const rate = item.errorRates[index] ?? 0;
            const current = timeMap.get(tw) ?? {
                clientErrorRate: 0,
                serverErrorRate: 0,
            };
            if (isClient) {
                current.clientErrorRate = rate;
            } else {
                current.serverErrorRate = rate;
            }
            timeMap.set(tw, current);
        });
    }

    const sortedTimes = Array.from(timeMap.keys()).sort((a, b) =>
        a.localeCompare(b),
    );

    return sortedTimes.map((tw) => {
        const entry = timeMap.get(tw) ?? {
            clientErrorRate: 0,
            serverErrorRate: 0,
        };
        return {
            rawTime: tw,
            formattedTime: formatChartTime(tw),
            clientErrorRate: entry.clientErrorRate,
            serverErrorRate: entry.serverErrorRate,
        };
    });
}

export function transformErrorsByConsumerChartData(
    data?: ErrorsByConsumerChartResponseDto | null,
): ErrorConsumerEntry[] {
    if (!data || data.consumerNames.length === 0) {
        return [];
    }

    return data.consumerNames.map((name, index) => {
        const cId = data.consumerIds[index] ?? index;
        return {
            consumerId: cId,
            consumerName: name || `Consumer #${String(cId)}`,
            requestCount: data.requestCounts[index] ?? 0,
        };
    });
}
