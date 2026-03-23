import type { GetErrorOptionsDto } from '../dto/get-error-options.dto.js';
import type { ErrorMetricsResponseDto } from '../dto/error-metrics-response.dto.js';
import type { ErrorsChartResponseDto } from '../dto/errors-chart-response.dto.js';
import type { ErrorsByConsumerChartResponseDto } from '../dto/errors-by-consumer-chart-response.dto.js';
import type { ErrorRatesChartResponseDto } from '../dto/error-rates-chart-response.dto.js';
import type { ErrorsTableResponseDto } from '../dto/errors-table-response.dto.js';
import type { ErrorDetailsResponseDto } from '../dto/error-details-response.dto.js';

export interface IErrorsService {
    /**
     * Get error metrics
     * @param getErrorOptionsDto
     * @returns {ErrorMetricsResponseDto}
     */
    getErrorMetrics(
        getErrorOptionsDto: GetErrorOptionsDto,
    ): Promise<ErrorMetricsResponseDto>;
    /**
     * Get errors chart
     * @param getErrorOptionsDto
     * @returns {ErrorsChartResponseDto[]}
     */
    getErrorsChart(
        getErrorOptionsDto: GetErrorOptionsDto,
    ): Promise<ErrorsChartResponseDto[]>;
    /**
     * Get errors by consumer chart
     * @param getErrorOptionsDto
     * @returns {ErrorsByConsumerChartResponseDto}
     */
    getErrorsByConsumerChart(
        getErrorOptionsDto: GetErrorOptionsDto,
    ): Promise<ErrorsByConsumerChartResponseDto>;
    /**
     * Get error rates chart
     * @param getErrorOptionsDto
     * @returns {ErrorRatesChartResponseDto[]}
     */
    getErrorRatesChart(
        getErrorOptionsDto: GetErrorOptionsDto,
    ): Promise<ErrorRatesChartResponseDto[]>;
    /**
     * Get errors table
     * @param getErrorOptionsDto
     * @returns {ErrorsTableItemResponseDto[]}
     */
    getErrorsTable(
        getErrorOptionsDto: GetErrorOptionsDto,
    ): Promise<ErrorsTableResponseDto[]>;
    /**
     * Get error details
     * @param getErrorOptionsDto
     * @returns {ErrorDetailsResponseDto}
     */
    getErrorDetails(
        getErrorOptionsDto: GetErrorOptionsDto,
    ): Promise<ErrorDetailsResponseDto>;
}
