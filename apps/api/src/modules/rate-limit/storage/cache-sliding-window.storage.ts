import type { Cache } from '@nestjs/cache-manager';
import type { IRateLimitStorage } from '../interfaces/rate-limit-storage.interface.js';
import type { RateLimitResult } from '../interfaces/rate-limit-result.interface.js';

interface TimestampRecord {
    timestamps: number[];
}

type CachedData = number | TimestampRecord | number[] | null | undefined;

export class CacheSlidingWindowStorage implements IRateLimitStorage {
    constructor(private readonly cacheService: Cache) {}

    async consume(
        key: string,
        maxRequests: number,
        windowMs: number,
    ): Promise<RateLimitResult> {
        const now = Date.now();
        const cached = await this.cacheService.get<CachedData>(key);

        if (typeof cached === 'number') {
            return this.handleNumericCounter(
                cached,
                key,
                maxRequests,
                windowMs,
                now,
            );
        }

        return this.handleSlidingTimestamps(
            cached,
            key,
            maxRequests,
            windowMs,
            now,
        );
    }

    private async handleNumericCounter(
        cached: number,
        key: string,
        maxRequests: number,
        windowMs: number,
        now: number,
    ): Promise<RateLimitResult> {
        if (cached >= maxRequests) {
            let remainingMs = (await this.cacheService.ttl(key)) ?? windowMs;
            if (remainingMs > now) {
                remainingMs = remainingMs - now;
            }
            const retryAfterSeconds = Math.max(
                1,
                Math.ceil(remainingMs / 1000),
            );
            return {
                isAllowed: false,
                limit: maxRequests,
                remaining: 0,
                resetMs: remainingMs,
                retryAfterSeconds,
            };
        }

        const nextVal = cached + 1;
        await this.cacheService.set(key, nextVal, windowMs);
        return {
            isAllowed: true,
            limit: maxRequests,
            remaining: Math.max(0, maxRequests - nextVal),
            resetMs: windowMs,
            retryAfterSeconds: 0,
        };
    }

    private async handleSlidingTimestamps(
        cached: CachedData,
        key: string,
        maxRequests: number,
        windowMs: number,
        now: number,
    ): Promise<RateLimitResult> {
        const timestamps = this.extractTimestamps(cached);
        const valid = timestamps.filter((t) => t > now - windowMs);

        if (valid.length >= maxRequests) {
            const oldest = valid[0] ?? now;
            const resetMs = Math.max(0, oldest + windowMs - now);
            const retryAfterSeconds = Math.max(1, Math.ceil(resetMs / 1000));

            return {
                isAllowed: false,
                limit: maxRequests,
                remaining: 0,
                resetMs,
                retryAfterSeconds,
            };
        }

        valid.push(now);
        await this.cacheService.set(key, { timestamps: valid }, windowMs);

        return {
            isAllowed: true,
            limit: maxRequests,
            remaining: maxRequests - valid.length,
            resetMs: windowMs,
            retryAfterSeconds: 0,
        };
    }

    async getRemaining(
        key: string,
        maxRequests: number,
        windowMs: number,
    ): Promise<number> {
        const cached = await this.cacheService.get<CachedData>(key);
        if (typeof cached === 'number') {
            return Math.max(0, maxRequests - cached);
        }

        if (cached && typeof cached === 'object') {
            const timestamps = this.extractTimestamps(cached);
            const valid = timestamps.filter((t) => t > Date.now() - windowMs);
            return Math.max(0, maxRequests - valid.length);
        }

        return maxRequests;
    }

    async clear(key: string): Promise<void> {
        await this.cacheService.del(key);
    }

    private extractTimestamps(cached: CachedData): number[] {
        if (Array.isArray(cached)) {
            return cached;
        }
        if (
            cached &&
            typeof cached === 'object' &&
            'timestamps' in cached &&
            Array.isArray(cached.timestamps)
        ) {
            return cached.timestamps;
        }
        return [];
    }
}
