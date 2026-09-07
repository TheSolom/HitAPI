import type { IRateLimitStorage } from '../interfaces/rate-limit-storage.interface.js';
import type { RateLimitResult } from '../interfaces/rate-limit-result.interface.js';
import { SLIDING_WINDOW_LUA } from '../constants/rate-limit.constant.js';

export interface RedisClientContract {
    eval(
        script: string,
        numkeys: number,
        ...args: (string | number)[]
    ): Promise<unknown>;
    zremrangebyscore?(
        key: string,
        min: number | string,
        max: number | string,
    ): Promise<number>;
    zcard?(key: string): Promise<number>;
    del?(key: string): Promise<number>;
}

export class RedisSlidingWindowStorage implements IRateLimitStorage {
    constructor(private readonly client: RedisClientContract) {}

    async consume(
        key: string,
        maxRequests: number,
        windowMs: number,
    ): Promise<RateLimitResult> {
        const now = Date.now();
        const evalFn = this.client.eval.bind(this.client);
        const evalResult = (await evalFn(
            SLIDING_WINDOW_LUA,
            1,
            key,
            now,
            windowMs,
            maxRequests,
        )) as [number, number, number, number];

        const [allowed, remaining, resetMs, retryAfter] = evalResult;

        return {
            isAllowed: allowed === 1,
            limit: maxRequests,
            remaining,
            resetMs,
            retryAfterSeconds: retryAfter,
        };
    }

    async getRemaining(
        key: string,
        maxRequests: number,
        windowMs: number,
    ): Promise<number> {
        if (this.client.zremrangebyscore && this.client.zcard) {
            const now = Date.now();
            const zremFn = this.client.zremrangebyscore.bind(this.client);
            const zcardFn = this.client.zcard.bind(this.client);
            await zremFn(key, 0, now - windowMs);
            const count = await zcardFn(key);
            return Math.max(0, maxRequests - count);
        }
        return maxRequests;
    }

    async clear(key: string): Promise<void> {
        if (this.client.del) {
            const delFn = this.client.del.bind(this.client);
            await delFn(key);
        }
    }
}
