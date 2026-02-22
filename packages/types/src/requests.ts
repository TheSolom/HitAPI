import type { ServerErrorsItem, ValidationErrorsItem } from './errors.js';
import type { ConsumerInfo } from './consumer.js';

export type PathInfo = {
    method: string;
    path: string;
};

export type StartupData = {
    paths: PathInfo[];
    versions: Record<string, string>;
    client: string;
};

export type StartupPayload = {
    messageUuid: string;
} & StartupData;

export type ConsumerMethodPath = PathInfo & {
    consumer?: string;
};

export type RequestsItem = ConsumerMethodPath & {
    statusCode: number;
    requestCount: number;
    requestSizeSum: number;
    responseSizeSum: number;
    responseTimes: Record<number, number>;
    requestSizes: Record<number, number>;
    responseSizes: Record<number, number>;
};

export type SyncPayload = {
    messageUuid: string;
    requests: RequestsItem[];
    validationErrors: ValidationErrorsItem[];
    serverErrors: ServerErrorsItem[];
    consumers: ConsumerInfo[];
    resources: {
        cpuPercent: number | null;
        memoryRss: number;
    };
    timestamp: number;
};
