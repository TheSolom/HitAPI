import type { ILogger } from './logger.js';

export type HitAPIConfig = {
    clientId: string;
    requestLogging?: Partial<RequestLoggingConfig>;
    logger?: ILogger;
};

export type RequestLoggingConfig = {
    enabled: boolean;
    logQueryParams: boolean;
    logRequestHeaders: boolean;
    logRequestBody: boolean;
    logResponseHeaders: boolean;
    logResponseBody: boolean;
    logException: boolean;
    captureLogs: boolean;
    captureTraces: boolean;
    maskQueryParams: RegExp[];
    maskHeaders: RegExp[];
    maskBodyFields: RegExp[];
    excludePaths: RegExp[];
};
