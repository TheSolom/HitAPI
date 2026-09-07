import { SetMetadata, applyDecorators } from '@nestjs/common';
import type { RateLimitOptions } from '../interfaces/rate-limit-config.interface.js';
import type { RateLimitType } from '../enums/rate-limit.enum.js';

export const RATE_LIMIT_METADATA_KEY = 'RATE_LIMIT_METADATA_KEY';
export const SKIP_RATE_LIMIT_METADATA_KEY = 'SKIP_RATE_LIMIT_METADATA_KEY';

/**
 * Decorator to configure rate limiting on a controller or route handler.
 * Can be passed a RateLimitType enum, string, or full RateLimitOptions.
 */
export function RateLimit(
    optionsOrType: RateLimitType | string | RateLimitOptions,
): MethodDecorator & ClassDecorator {
    const options: RateLimitOptions =
        typeof optionsOrType === 'string'
            ? { type: optionsOrType }
            : optionsOrType;

    return applyDecorators(SetMetadata(RATE_LIMIT_METADATA_KEY, options));
}

/**
 * Decorator to skip rate limiting for a specific route handler.
 */
export function SkipRateLimit(): MethodDecorator {
    return applyDecorators(SetMetadata(SKIP_RATE_LIMIT_METADATA_KEY, true));
}
