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
