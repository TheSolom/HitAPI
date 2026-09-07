import type { RateLimitConfig } from '../interfaces/rate-limit-config.interface.js';
import type { RateLimitResult } from '../interfaces/rate-limit-result.interface.js';
import type { RateLimitType } from '../enums/rate-limit.enum.js';

export interface IRateLimitService {
    /**
     * Consumes one request token using an atomic sliding window and returns rate limit metadata.
     * Does NOT throw an exception when limit is exceeded.
     */
    consume(
        identifier: string,
        type: RateLimitType | string,
        config?: Partial<RateLimitConfig>,
    ): Promise<RateLimitResult>;

    /**
     * Checks if the rate limit has been exceeded for the given identifier and type.
     * Throws ThrottlerException when the limit is exceeded.
     */
    checkRateLimit(
        identifier: string,
        type: RateLimitType | string,
        config?: Partial<RateLimitConfig>,
    ): Promise<RateLimitResult>;

    /**
     * Clears the rate limit for the given identifier and type.
     */
    clearRateLimit(
        identifier: string,
        type: RateLimitType | string,
    ): Promise<void>;

    /**
     * Gets the remaining requests for the given identifier and type.
     */
    getRemainingRequests(
        identifier: string,
        type: RateLimitType | string,
        config?: Partial<RateLimitConfig>,
    ): Promise<number>;

    /**
     * Resolves the effective rate limit config for a given type and optional overrides.
     */
    resolveConfig(
        type: RateLimitType | string,
        overrides?: Partial<RateLimitConfig>,
    ): RateLimitConfig;
}
