import type { RestfulMethod } from '@hitapi/shared/enums';
import type { Period } from './period.js';

export interface GetPerformanceOptions {
    appId: string;
    period?: Period;
    consumerId?: number;
    consumerGroupId?: number;
    method?: RestfulMethod;
    path?: string;
    pathExact?: boolean;
    statusCode?: string;
}

export interface PerformanceMetricsResponseDto {
    totalRequestCount: number;
    responseTimeP50: number;
    responseTimeP75: number;
    responseTimeP95: number;
    apdexSatisfiedCount: number;
    apdexToleratedCount: number;
    apdexFrustratedCount: number;
    apdexScore: number;
    targetResponseTimeMs: number;
}

export interface ApdexScoreChartResponseDto {
    timeWindows: string[];
    apdexScores: Array<number | null>;
    totalRequestCounts: number[];
}

export interface ResponseTimeChartResponseDto {
    timeWindows: string[];
    responseTimeP50: Array<number | null>;
    responseTimeP75: Array<number | null>;
    responseTimeP95: Array<number | null>;
}

export interface PerformanceEndpointsTableResponseDto {
    id: string;
    method: RestfulMethod;
    path: string;
    totalRequestCount: number;
    responseTimeP50: number;
    responseTimeP75: number;
    responseTimeP95: number;
    apdexSatisfiedCount: number;
    apdexToleratedCount: number;
    apdexFrustratedCount: number;
    apdexScore: number;
    targetResponseTimeMs: number;
    excluded: boolean;
    removed: boolean;
}
