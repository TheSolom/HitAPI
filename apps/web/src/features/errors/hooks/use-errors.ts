import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
    ErrorDetailsResponseDto,
    ErrorMetricsResponseDto,
    ErrorRatesChartResponseDto,
    ErrorsByConsumerChartResponseDto,
    ErrorsChartResponseDto,
    ErrorsTableResponseDto,
    GetErrorOptions,
    GetValidationAndServerErrorOptions,
    ServerErrorsTableResponseDto,
    ValidationErrorsTableResponseDto,
} from '@hitapi/types';
import { errorsApi } from '../api';
import { errorKeys } from './errors.keys';

export function useErrorMetricsQuery(options: Partial<GetErrorOptions>) {
    return useQuery<ErrorMetricsResponseDto | null>({
        queryKey: errorKeys.metrics(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await errorsApi.metrics(
                options as GetErrorOptions,
                signal,
            );
            return res.data ?? null;
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}

export function useErrorsChartQuery(options: Partial<GetErrorOptions>) {
    return useQuery<ErrorsChartResponseDto[]>({
        queryKey: errorKeys.chart(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await errorsApi.chart(
                options as GetErrorOptions,
                signal,
            );
            return res.data ?? [];
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}

export function useErrorsByConsumerChartQuery(
    options: Partial<GetErrorOptions>,
) {
    return useQuery<ErrorsByConsumerChartResponseDto | null>({
        queryKey: errorKeys.byConsumerChart(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await errorsApi.byConsumerChart(
                options as GetErrorOptions,
                signal,
            );
            return res.data ?? null;
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}

export function useErrorRatesChartQuery(options: Partial<GetErrorOptions>) {
    return useQuery<ErrorRatesChartResponseDto[]>({
        queryKey: errorKeys.ratesChart(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await errorsApi.ratesChart(
                options as GetErrorOptions,
                signal,
            );
            return res.data ?? [];
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}

export function useErrorsTableQuery(options: Partial<GetErrorOptions>) {
    return useQuery<ErrorsTableResponseDto[]>({
        queryKey: errorKeys.table(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await errorsApi.table(
                options as GetErrorOptions,
                signal,
            );
            return res.data ?? [];
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}

export function useErrorDetailsQuery(options: Partial<GetErrorOptions>) {
    return useQuery<ErrorDetailsResponseDto | null>({
        queryKey: errorKeys.details(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await errorsApi.details(
                options as GetErrorOptions,
                signal,
            );
            return res.data ?? null;
        },
        enabled: Boolean(options.appId),
    });
}

export function useValidationErrorsTableQuery(
    options: Partial<GetValidationAndServerErrorOptions>,
) {
    return useQuery<ValidationErrorsTableResponseDto[]>({
        queryKey: errorKeys.validationErrorsTable(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await errorsApi.validationErrorsTable(
                options as GetValidationAndServerErrorOptions,
                signal,
            );
            return res.data ?? [];
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}

export function useServerErrorsTableQuery(
    options: Partial<GetValidationAndServerErrorOptions>,
) {
    return useQuery<ServerErrorsTableResponseDto[]>({
        queryKey: errorKeys.serverErrorsTable(options),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await errorsApi.serverErrorsTable(
                options as GetValidationAndServerErrorOptions,
                signal,
            );
            return res.data ?? [];
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}
