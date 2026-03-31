import type { ClsStore } from 'nestjs-cls';

export interface AppClsStore extends ClsStore {
    readonly startTime: bigint;
    readonly traceId: string;
    readonly ip: string;
    readonly userAgent: string;
}

export interface LogMeta extends NodeJS.ReadOnlyDict<unknown> {
    readonly context?: string;
    readonly error?: string | Error;
    readonly userId?: string;
    readonly method?: string;
    readonly path?: string;
    readonly statusCode?: number;
    readonly duration?: number;
    readonly traceId?: string;
    readonly ip?: string;
    readonly userAgent?: string;
}
