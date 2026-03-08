import type { ConsumerMethodPath } from '@hitapi/types';

export type RequestInfo = ConsumerMethodPath & {
    statusCode: number;
    responseTime: number;
    requestSize?: string | number;
    responseSize?: string | number;
};
