import type { RestfulMethod } from '@hitapi/shared/enums';
import type { Period } from './period.js';

export enum ResponseStatus {
    SUCCESSFUL = 'Successful',
    CLIENT_ERROR = 'Client error',
    SERVER_ERROR = 'Server error',
}

export interface TrafficMetricsResponseDto {
    totalRequestCount: number;
    requestsPerMinute: number;
    clientErrorCount: number;
    serverErrorCount: number;
    errorRate: number;
    requestSizeSum: number;
    requestSizeAvg?: number;
    responseSizeSum: number;
    responseSizeAvg?: number;
    totalDataTransferred: number;
    uniqueConsumerCount: number;
}

export interface RequestsChartResponseDto {
    responseStatus: ResponseStatus;
    timeWindows: string[];
    requestCounts: number[];
    statusCodeCounts: Array<[number, number]>[];
}

export interface RequestsPerMinuteChartResponseDto {
    timeWindows: string[];
    requestsPerMinute: number[];
}

export interface DataTransferredChartResponseDto {
    timeWindows: string[];
    requestSizeSums: number[];
    responseSizeSums: number[];
}

export interface TrafficEndpointsTableResponseDto {
    id: string;
    method: RestfulMethod;
    path: string;
    totalRequestCount: number;
    clientErrorCount: number;
    serverErrorCount: number;
    errorRate: number;
    dataTransferred: number;
    excluded: boolean;
    removed: boolean;
}

export interface GetTrafficOptions {
    appId: string;
    period?: Period;
    consumerId?: number;
    consumerGroupId?: number;
    method?: RestfulMethod;
    path?: string;
    pathExact?: boolean;
    statusCode?: string;
}

export interface SizeHistogramResponseDto {
    bins: number[];
    counts: number[];
    binSize: number;
}

export interface StatusCodeCountsResponseDto {
    method: RestfulMethod;
    path: string;
    statusCode: number;
    description?: string;
    requestCount: number;
}

export interface RequestsByConsumerChartResponseDto {
    responseStatus: ResponseStatus;
    consumerIds: number[];
    consumerNames: string[];
    requestCounts: number[];
    statusCodeCounts?: Array<[number, number]>[];
}

export interface GetRequestsByConsumerChartOptions extends GetTrafficOptions {
    limit?: number;
}

export interface ExportTrafficCsvOptions extends GetTrafficOptions {
    limit?: number;
}
