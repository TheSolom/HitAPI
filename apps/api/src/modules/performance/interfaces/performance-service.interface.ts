import type { GetPerformanceOptionsDto } from '../dto/get-performance-options.dto.js';
import type { PerformanceMetricsResponseDto } from '../dto/performance-metrics-response.dto.js';
import type { ApdexScoreChartResponseDto } from '../dto/apdex-score-chart-response.dto.js';
import type { ResponseTimeChartResponseDto } from '../dto/response-time-chart-response.dto.js';
import type { PerformanceEndpointsTableResponseDto } from '../dto/performance-endpoints-table-response.dto.js';

export interface IPerformanceService {
    /**
     * Get aggregate performance metrics for an app within a period.
     */
    getPerformanceMetrics(
        options: GetPerformanceOptionsDto,
    ): Promise<PerformanceMetricsResponseDto>;
    /**
     * Get Apdex score over time for an app within a period.
     */
    getApdexScoreChart(
        options: GetPerformanceOptionsDto,
    ): Promise<ApdexScoreChartResponseDto>;
    /**
     * Get P50/P75/P95 response time over time for an app within a period.
     */
    getResponseTimeChart(
        options: GetPerformanceOptionsDto,
    ): Promise<ResponseTimeChartResponseDto>;
    /**
     * Get per-endpoint performance breakdown for an app within a period.
     */
    getPerformanceEndpointsTable(
        options: GetPerformanceOptionsDto,
    ): Promise<PerformanceEndpointsTableResponseDto[]>;
}
