import type { ExecutionContext } from '@nestjs/common';
import type {
    RateLimitTracker,
    RateLimitType,
} from '../enums/rate-limit.enum.js';

export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

export type RateLimitKeyExtractor = (
    context: ExecutionContext,
) => string | Promise<string>;

export interface RateLimitOptions extends Partial<RateLimitConfig> {
    type?: RateLimitType | string;
    tracker?: RateLimitTracker;
    keyPrefix?: string;
    keyExtractor?: RateLimitKeyExtractor;
    errorMessage?: string;
}
