import type { RateLimitResult } from './rate-limit-result.interface.js';

export interface IRateLimitStorage {
    consume(
        key: string,
        maxRequests: number,
        windowMs: number,
    ): Promise<RateLimitResult>;

    getRemaining(
        key: string,
        maxRequests: number,
        windowMs: number,
    ): Promise<number>;

    clear(key: string): Promise<void>;
}
