import { api } from '@/lib/api/client';
import type {
    CustomResponse,
    ErrorDetailsResponseDto,
    ErrorMetricsResponseDto,
    ErrorRatesChartResponseDto,
    ErrorsByConsumerChartResponseDto,
    ErrorsChartResponseDto,
    ErrorsTableResponseDto,
    GetErrorOptions,
    GetValidationAndServerErrorOptions,
    QueryParams,
    ServerErrorsTableResponseDto,
    ValidationErrorsTableResponseDto,
} from '@hitapi/types';

export type GetErrorMetricsResponse = CustomResponse<ErrorMetricsResponseDto>;
export type GetErrorsChartResponse = CustomResponse<ErrorsChartResponseDto[]>;
export type GetErrorsByConsumerChartResponse =
    CustomResponse<ErrorsByConsumerChartResponseDto>;
export type GetErrorRatesChartResponse = CustomResponse<
    ErrorRatesChartResponseDto[]
>;
export type GetErrorsTableResponse = CustomResponse<ErrorsTableResponseDto[]>;
export type GetErrorDetailsResponse = CustomResponse<ErrorDetailsResponseDto>;
export type GetValidationErrorsTableResponse = CustomResponse<
    ValidationErrorsTableResponseDto[]
>;
export type GetServerErrorsTableResponse = CustomResponse<
    ServerErrorsTableResponseDto[]
>;

export const errorsApi = {
    metrics: (options: GetErrorOptions, signal?: AbortSignal) =>
        api.get<GetErrorMetricsResponse>(
            '/errors/metrics',
            options as unknown as QueryParams,
            signal,
        ),

    chart: (options: GetErrorOptions, signal?: AbortSignal) =>
        api.get<GetErrorsChartResponse>(
            '/errors/chart',
            options as unknown as QueryParams,
            signal,
        ),

    byConsumerChart: (options: GetErrorOptions, signal?: AbortSignal) =>
        api.get<GetErrorsByConsumerChartResponse>(
            '/errors/by-consumer-chart',
            options as unknown as QueryParams,
            signal,
        ),

    ratesChart: (options: GetErrorOptions, signal?: AbortSignal) =>
        api.get<GetErrorRatesChartResponse>(
            '/errors/error-rates-chart',
            options as unknown as QueryParams,
            signal,
        ),

    table: (options: GetErrorOptions, signal?: AbortSignal) =>
        api.get<GetErrorsTableResponse>(
            '/errors/table',
            options as unknown as QueryParams,
            signal,
        ),

    details: (options: GetErrorOptions, signal?: AbortSignal) =>
        api.get<GetErrorDetailsResponse>(
            '/errors/details',
            options as unknown as QueryParams,
            signal,
        ),

    validationErrorsTable: (
        options: GetValidationAndServerErrorOptions,
        signal?: AbortSignal,
    ) =>
        api.get<GetValidationErrorsTableResponse>(
            '/errors/validation-errors-table',
            options as unknown as QueryParams,
            signal,
        ),

    serverErrorsTable: (
        options: GetValidationAndServerErrorOptions,
        signal?: AbortSignal,
    ) =>
        api.get<GetServerErrorsTableResponse>(
            '/errors/server-errors-table',
            options as unknown as QueryParams,
            signal,
        ),
};
