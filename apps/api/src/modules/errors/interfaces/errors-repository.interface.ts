import type { RestfulMethod } from '@hitapi/shared/enums';
import type { MaybeType } from '../../../common/types/maybe.type.js';
import type { GetErrorOptionsDto } from '../dto/get-error-options.dto.js';
import type { ServerErrorsTableResponseDto } from '../dto/server-errors-table-response.dto.js';
import type { ValidationErrorsTableResponseDto } from '../dto/validation-errors-table-response.dto.js';

export interface IErrorMetric {
    totalRequestCount: string;
    totalErrorCount: string;
    clientErrorCount: string;
    serverErrorCount: string;
}

export interface IErrorChart {
    timeWindow: Date;
    requestCount: string;
    statusCode: string;
}

export interface IErrorByConsumerChart {
    consumerId: string;
    consumerName: string;
    requestCount: string;
}

export interface IErrorRateChart {
    timeWindow: Date;
    errorCount: string;
}

export interface IErrorTable {
    id: string;
    method: RestfulMethod;
    path: string;
    statusCode: string;
    requestCount: string;
    affectedConsumers: string;
}

export interface IErrorDetails {
    requestCount: string;
    affectedConsumers: string;
    lastTimestamp: Date;
}

export interface IErrorsRepository {
    /**
     * Get error metrics
     * @param criteria
     * @returns {Promise<MaybeType<IErrorMetric>>}
     */
    getErrorMetrics(
        criteria: Pick<GetErrorOptionsDto, 'appId' | 'period'>,
    ): Promise<MaybeType<Omit<IErrorMetric, 'totalRequestCount'>>>;
    /**
     * Get error metrics filtered
     * @param criteria
     * @returns {Promise<MaybeType<IErrorMetric>>}
     */
    getErrorMetricsFiltered(
        criteria: GetErrorOptionsDto,
    ): Promise<MaybeType<IErrorMetric>>;
    /**
     * Get errors chart
     * @param criteria
     * @returns {Promise<{ clientErrors: IErrorChart[]; serverErrors: IErrorChart[] }>}
     */
    getErrorsChart(
        criteria: GetErrorOptionsDto,
    ): Promise<{ clientErrors: IErrorChart[]; serverErrors: IErrorChart[] }>;
    /**
     * Get errors by consumer chart
     * @param criteria
     * @returns {Promise<{ clientErrors: IErrorChart[]; serverErrors: IErrorChart[] }>}
     */
    getErrorsByConsumerChart(
        criteria: GetErrorOptionsDto,
    ): Promise<IErrorByConsumerChart[]>;
    /**
     * Get error rates chart
     * @param criteria
     * @returns {Promise<{ totals: Map<string, number>; clientErrors: IErrorRateChart[]; serverErrors: IErrorRateChart[] }>}
     */
    getErrorRatesChart(criteria: GetErrorOptionsDto): Promise<{
        totals: Map<string, number>;
        clientErrors: IErrorRateChart[];
        serverErrors: IErrorRateChart[];
    }>;
    /**
     * Get errors table
     * @param criteria
     * @returns {Promise<IErrorTable[]>}
     */
    getErrorsTable(criteria: GetErrorOptionsDto): Promise<IErrorTable[]>;
    /**
     * Get error details
     * @param criteria
     * @returns {Promise<MaybeType<IErrorDetail>>}
     */
    getErrorDetails(
        criteria: GetErrorOptionsDto,
    ): Promise<MaybeType<IErrorDetails>>;
    /**
     * Get validation errors table
     * @param criteria
     * @returns {Promise<MaybeType<IValidationError[]>>}
     */
    getValidationErrorsTable(
        criteria: GetErrorOptionsDto,
    ): Promise<ValidationErrorsTableResponseDto[]>;
    /**
     * Get server errors table
     * @param criteria
     * @returns {Promise<MaybeType<IServerError[]>>}
     */
    getServerErrorsTable(
        criteria: GetErrorOptionsDto,
    ): Promise<ServerErrorsTableResponseDto[]>;
}
