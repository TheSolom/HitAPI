import type {
    ApdexScoreChartResponseDto,
    ResponseTimeChartResponseDto,
} from '@hitapi/types';
import { formatTimeWindow } from '../../utils';

export interface ApdexChartDataPoint {
    timeWindow: string;
    formattedTime: string;
    apdexScore: number | null;
    totalRequests: number;
}

export interface ResponseTimeChartDataPoint {
    timeWindow: string;
    formattedTime: string;
    p50: number | null;
    p75: number | null;
    p95: number | null;
}

export function transformApdexChartData(
    data?: ApdexScoreChartResponseDto | null,
): ApdexChartDataPoint[] {
    if (!data || data.timeWindows.length === 0) {
        return [];
    }

    return data.timeWindows.map((tw, index) => {
        const rawScore = data.apdexScores[index];
        let normalized: number | null = null;
        if (rawScore !== null) {
            normalized = rawScore > 1 ? rawScore / 100 : rawScore;
        }

        return {
            timeWindow: tw,
            formattedTime: formatTimeWindow(tw),
            apdexScore: normalized,
            totalRequests: data.totalRequestCounts[index] ?? 0,
        };
    });
}

export function transformResponseTimeChartData(
    data?: ResponseTimeChartResponseDto | null,
): ResponseTimeChartDataPoint[] {
    if (!data || data.timeWindows.length === 0) {
        return [];
    }

    return data.timeWindows.map((tw, index) => ({
        timeWindow: tw,
        formattedTime: formatTimeWindow(tw),
        p50: data.responseTimeP50[index] ?? null,
        p75: data.responseTimeP75[index] ?? null,
        p95: data.responseTimeP95[index] ?? null,
    }));
}
