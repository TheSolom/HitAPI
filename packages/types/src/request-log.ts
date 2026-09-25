import type { RestfulMethod } from '@hitapi/shared/enums';
import type { MetadataResponse } from './api-response.js';
import type { OrderDirection } from './common.js';
import type {
    CursorPaginationOptions,
    OffsetPaginationOptions,
} from './pagination.js';
import type { Period } from './period.js';

export type Request = {
    url: string;
    method: string;
    headers: [string, string][];
    timestamp: number;
    path?: string;
    size?: number;
    body?: Buffer;
    clientIp?: string;
    consumer?: string;
};

export type Response = {
    statusCode: number;
    responseTime: number;
    headers: [string, string][];
    size?: number;
    body?: Buffer;
};

export type LogRecord = {
    level: string;
    message: string;
    timestamp: number;
    logger?: string;
};

export type RequestLogItem = {
    uuid: string;
    request: Request;
    response: Response;
    exception?: {
        type: string;
        message: string;
        stacktrace: string;
    };
    logs?: LogRecord[];
    traceId?: string;
};

export interface RequestLogResponseDto {
    requestUuid: string;
    method: RestfulMethod;
    path: string;
    url: string;
    statusCode: number;
    statusText: string;
    responseTime: number;
    applicationLogsCountByLevel: Record<string, number>;
    timestamp: Date | string;
    requestSize?: number;
    responseSize?: number;
    clientIp?: string;
    clientCountryName?: string;
    clientCountryCode?: string;
    consumerId?: number;
    consumerIdentifier?: string;
    consumerName?: string;
    consumerGroupName?: string;
}

export interface RequestLogResponsePaginatedDto {
    data: RequestLogResponseDto[];
    metadata: MetadataResponse;
}

export interface RequestLogDetailsResponseDto extends RequestLogResponseDto {
    requestHeaders: [string, string][];
    requestContentType: string;
    responseHeaders: [string, string][];
    responseContentType: string;
    applicationLogsCount: number;
    requestBody?: string;
    responseBody?: string;
    exceptionType?: string;
    exceptionMessage?: string;
    exceptionStacktrace?: string;
    traceId?: string;
}

export interface RequestLogTimelineResponseDto {
    timeWindows: string[];
    itemCounts: number[];
}

export interface RequestLogTimelineChartDto {
    timeWindows: string[];
    itemCounts: number[];
}

export interface ApplicationLogResponseDto {
    message: string;
    timestamp: Date | string;
    level?: string;
    logger?: string;
    file?: string;
    line?: number;
}

export interface CreateRequestLogPayload {
    requestUuid: string;
    appId: string;
    method: RestfulMethod;
    path: string;
    url: string;
    statusCode: number;
    statusText: string;
    responseTime: number;
    requestHeaders: [string, string][];
    responseHeaders: [string, string][];
    timestamp: Date;
    requestSize?: number;
    requestBody?: Buffer;
    responseSize?: number;
    responseBody?: Buffer;
    clientIp?: string;
    clientCountryCode?: string;
    consumerId?: number;
    exceptionType?: string;
    exceptionMessage?: string;
    exceptionStacktrace?: string;
    traceId?: string;
}

export interface CreateApplicationLogPayload {
    requestUuid: string;
    message: string;
    level: string;
    timestamp: Date;
    logger?: string;
    file?: string;
    line?: number;
}

export interface BaseRequestLogsOptions {
    appId: string;
    period?: Period;
    consumerId?: number;
    consumerGroupId?: number;
    method?: RestfulMethod;
    path?: string;
    pathExact?: boolean;
    statusCode?: number | string;
    minTimestamp?: string;
    maxTimestamp?: string;
    url?: string;
    minRequestSize?: number;
    maxRequestSize?: number;
    minResponseSize?: number;
    maxResponseSize?: number;
    minResponseTime?: number;
    maxResponseTime?: number;
    requestBody?: string;
    responseBody?: string;
    clientIp?: string;
    logLevel?: string;
}

export interface GetRequestLogsOptions
    extends
        BaseRequestLogsOptions,
        Partial<OffsetPaginationOptions>,
        Partial<CursorPaginationOptions> {
    order?: OrderDirection;
}

export interface ExportRequestLogsOptions extends BaseRequestLogsOptions {
    order?: OrderDirection;
    limit?: number;
}

export type GetRequestLogTimelineOptions = BaseRequestLogsOptions;
