import type { QueryRunner } from 'typeorm';
import type { GetTrafficOptionsDto } from '../dto/get-traffic-options.dto.js';
import type { TrafficMetricsResponseDto } from '../dto/traffic-metrics-response.dto.js';
import type { CreateTrafficMetricsDto } from '../dto/create-traffic-metrics.dto.js';
import type { RequestsChartResponseDto } from '../dto/requests-chart-response.dto.js';
import type { RequestsPerMinuteChartResponseDto } from '../dto/requests-per-minute-chart-response.dto.js';
import type { DataTransferredChartResponseDto } from '../dto/data-transferred-chart-response.dto.js';
import type { RequestsByConsumerChartResponseDto } from '../dto/requests-by-consumer-chart-response.dto.js';
import type { GetRequestsByConsumerChartOptionsDto } from '../dto/get-requests-by-consumer-chart-options.dto.js';
import type { SizeHistogramResponseDto } from '../dto/size-histogram-response.dto.js';
import type { TrafficEndpointsTableResponseDto } from '../dto/traffic-endpoints-table-response.dto.js';
import type { StatusCodeCountsResponseDto } from '../dto/status-code-counts-response.dto.js';
import type { ExportTrafficCsvOptionsDto } from '../dto/export-traffic-csv-options.dto.js';

export interface ITrafficService {
    /**
     * Get traffic metrics for an app within a period.
     * @param getTrafficOptionsDto
     * @returns {Promise<TrafficMetricsResponseDto>}
     */
    getTrafficMetrics(
        getTrafficOptionsDto: GetTrafficOptionsDto,
    ): Promise<TrafficMetricsResponseDto>;
    /**
     * Upsert traffic metrics.
     * @param createTrafficMetricsDto
     * @returns {Promise<void>}
     */
    upsertTrafficMetrics(
        createTrafficMetricsDto: CreateTrafficMetricsDto,
        queryRunner?: QueryRunner,
    ): Promise<void>;
    /**
     * Get requests chart for an app within a period.
     * @param getRequestsChartOptionsDto
     * @returns {Promise<RequestsChartResponseDto[]>}
     */
    getRequestsChart(
        getRequestsChartOptionsDto: GetTrafficOptionsDto,
    ): Promise<RequestsChartResponseDto[]>;
    /**
     * Get requests per minute chart for an app within a period.
     * @param getRequestsPerMinuteChartOptionsDto
     * @returns {Promise<RequestsChartResponseDto>}
     */
    getRequestsPerMinuteChart(
        getRequestsPerMinuteChartOptionsDto: GetTrafficOptionsDto,
    ): Promise<RequestsPerMinuteChartResponseDto>;
    /**
     * Get data transferred chart for an app within a period.
     * @param getDataTransferredChartOptionsDto
     * @returns {Promise<DataTransferredChartResponseDto>}
     */
    getDataTransferredChart(
        getDataTransferredChartOptionsDto: GetTrafficOptionsDto,
    ): Promise<DataTransferredChartResponseDto>;
    /**
     * Get requests by consumer chart for an app within a period.
     * @param getRequestsByConsumerChartOptionsDto
     * @returns {Promise<RequestsByConsumerChartResponseDto[]>}
     */
    getRequestsByConsumerChart(
        getRequestsByConsumerChartOptionsDto: GetRequestsByConsumerChartOptionsDto,
    ): Promise<RequestsByConsumerChartResponseDto[]>;
    /**
     * Get request size histogram for an app within a period.
     * @param getRequestSizeHistogramOptionsDto
     * @returns {Promise<SizeHistogramResponseDto>}
     */
    getRequestSizeHistogram(
        getRequestSizeHistogramOptionsDto: GetTrafficOptionsDto,
    ): Promise<SizeHistogramResponseDto>;
    /**
     * Get response size histogram for an app within a period.
     * @param getResponseSizeHistogramOptionsDto
     * @returns {Promise<SizeHistogramResponseDto>}
     */
    getResponseSizeHistogram(
        getResponseSizeHistogramOptionsDto: GetTrafficOptionsDto,
    ): Promise<SizeHistogramResponseDto>;
    /**
     * Get traffic endpoints table for an app within a period.
     * @param getTrafficEndpointsTableOptionsDto
     * @returns {Promise<TrafficEndpointsTableResponseDto[]>}
     */
    getTrafficEndpointsTable(
        getTrafficEndpointsTableOptionsDto: GetTrafficOptionsDto,
    ): Promise<TrafficEndpointsTableResponseDto[]>;
    /**
     * Get status code counts for an app within a period.
     * @param getStatusCodeCountsOptionsDto
     * @returns {Promise<StatusCodeCountsResponseDto[]>}
     */
    getStatusCodeCounts(
        getStatusCodeCountsOptionsDto: GetTrafficOptionsDto,
    ): Promise<StatusCodeCountsResponseDto[]>;
    /**
     * Export traffic data to CSV.
     * @param exportTrafficCsvOptionsDto
     * @returns {Promise<string>}
     */
    exportTrafficCsv(
        exportTrafficCsvOptionsDto: ExportTrafficCsvOptionsDto,
    ): Promise<string>;
}
