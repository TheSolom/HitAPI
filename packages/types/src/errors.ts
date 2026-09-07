import type { RestfulMethod } from '@hitapi/shared/enums';
import type { Period } from './period.js';
import type { ConsumerMethodPath } from './requests.js';

export enum ErrorType {
    CLIENT_ERROR = 'Client error',
    SERVER_ERROR = 'Server error',
}

export interface ErrorMetricsResponseDto {
    totalRequestCount: number;
    totalErrorCount: number;
    clientErrorCount: number;
    serverErrorCount: number;
    errorRate: number;
}

export interface ErrorsChartResponseDto {
    errorType: ErrorType;
    timeWindows: string[];
    requestCounts: number[];
    statusCodeCounts: [number, number][][];
}

export interface ErrorsByConsumerChartResponseDto {
    consumerIds: number[];
    consumerNames: string[];
    requestCounts: number[];
}

export interface ErrorRatesChartResponseDto {
    errorType: ErrorType;
    timeWindows: string[];
    errorRates: number[];
}

export interface ErrorsTableResponseDto {
    id: string;
    method: RestfulMethod;
    path: string;
    statusCode: number;
    statusText: string;
    requestCount: number;
    affectedConsumers: number;
    expected: boolean;
}

export interface ErrorDetailsResponseDto {
    requestCount: number;
    affectedConsumers: number;
    lastTimestamp: string;
}

export interface ValidationErrorsTableResponseDto {
    msg: string;
    type: string;
    loc: string[];
    errorCount: number;
}

export interface ServerErrorsTableResponseDto {
    msg: string;
    type: string;
    traceback: string;
    errorCount: number;
}

export interface GetErrorOptions {
    appId: string;
    period?: Period;
    consumerId?: number;
    consumerGroupId?: number;
    method?: RestfulMethod;
    path?: string;
    pathExact?: boolean;
    statusCode?: string;
}

export interface GetValidationAndServerErrorOptions {
    appId: string;
    period?: Period;
    limit?: number;
    consumerId?: number;
    consumerGroupId?: number;
    method?: RestfulMethod;
    path?: string;
    pathExact?: boolean;
}

export interface AddServerErrorPayload {
    msg: string;
    type: string;
    traceback: string;
    errorCount: number;
    endpointId: string;
    consumerId?: number;
}

export interface AddValidationErrorPayload {
    msg: string;
    type: string;
    loc: string[];
    errorCount: number;
    endpointId: string;
    consumerId?: number;
}

export interface GetServerErrorOptions {
    id?: bigint;
    msg?: string;
    type?: string;
    traceback?: string;
    endpointId?: string;
    consumerId?: number;
}

export interface GetValidationErrorOptions {
    id?: bigint;
    msg?: string;
    type?: string;
    loc?: string[];
    endpointId?: string;
    consumerId?: number;
}

export type ValidationErrorsItem = ConsumerMethodPath & {
    msg: string;
    type: string;
    loc: string[];
    errorCount: number;
};

export type ServerErrorsItem = ConsumerMethodPath & {
    msg: string;
    type: string;
    traceback: string;
    errorCount: number;
};

type Error = {
    msg: string;
    type: string;
};

export type ValidationError = Error & {
    loc: string;
};

export type ServerError = Error & {
    traceback: string;
};
