import type { RateLimitConfig } from '../interfaces/rate-limit-config.interface.js';

export interface IRateLimitService {
    /**
     * Checks if the rate limit has been exceeded for the given identifier and type.
     * @param identifier The identifier to check the rate limit for.
     * @param type The type of the rate limit.
     * @param config Optional configuration for the rate limit.
     * @returns {Promise<void>} A promise that resolves when the check is complete.
     */
    checkRateLimit(
        identifier: string,
        type: string,
        config?: Partial<RateLimitConfig>,
    ): Promise<void>;
    /**
     * Clears the rate limit for the given identifier and type.
     * @param identifier The identifier to clear the rate limit for.
     * @param type The type of the rate limit.
     * @returns {Promise<void>} A promise that resolves when the rate limit is cleared.
     */
    clearRateLimit(identifier: string, type: string): Promise<void>;
    /**
     * Gets the remaining requests for the given identifier and type.
     * @param identifier The identifier to get the remaining requests for.
     * @param type The type of the rate limit.
     * @returns {Promise<number>} A promise that resolves to the remaining requests count.
     */
    getRemainingRequests(identifier: string, type: string): Promise<number>;
}
