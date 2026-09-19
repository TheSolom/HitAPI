import type { GetPerformanceOptionsDto } from '../dto/get-performance-options.dto.js';

export interface IPerformanceMetricsRaw {
    totalRequestCount: string;
    responseTimeP50: string;
    responseTimeP75: string;
    responseTimeP95: string;
    apdexSatisfiedCount: string;
    apdexToleratedCount: string;
    apdexFrustratedCount: string;
    targetResponseTimeMs: string;
}

export interface IApdexScoreChartRaw {
    timeWindow: Date;
    totalRequestCount: string;
    apdexSatisfiedCount: string;
    apdexToleratedCount: string;
}

export interface IResponseTimeChartRaw {
    timeWindow: Date;
    responseTimeP50: string | null;
    responseTimeP75: string | null;
    responseTimeP95: string | null;
}

export interface IPerformanceEndpointsTableRaw {
    id: string;
    method: string;
    path: string;
    totalRequestCount: string;
    responseTimeP50: string;
    responseTimeP75: string;
    responseTimeP95: string;
    apdexSatisfiedCount: string;
    apdexToleratedCount: string;
    apdexFrustratedCount: string;
    targetResponseTimeMs: string;
    excluded: string;
    removed: string;
}

export interface IPerformanceRepository {
    /**
     * Get aggregate performance metrics for an app within a period.
     */
    getPerformanceMetrics(
        options: GetPerformanceOptionsDto,
    ): Promise<IPerformanceMetricsRaw | undefined>;

    /**
     * Get apdex score time-series data.
     */
    getApdexScoreChart(
        options: GetPerformanceOptionsDto,
    ): Promise<IApdexScoreChartRaw[]>;

    /**
     * Get response time percentile time-series data.
     */
    getResponseTimeChart(
        options: GetPerformanceOptionsDto,
    ): Promise<IResponseTimeChartRaw[]>;

    /**
     * Get per-endpoint performance breakdown.
     */
    getPerformanceEndpointsTable(
        options: GetPerformanceOptionsDto,
    ): Promise<IPerformanceEndpointsTableRaw[]>;
}
