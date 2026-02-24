import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ThrottlerException } from '@nestjs/throttler';
import type { IRateLimitService } from './interfaces/rate-limit-service.interface.js';
import type { RateLimitConfig } from './interfaces/rate-limit-config.interface.js';

@Injectable()
export class RateLimitService implements IRateLimitService {
    private readonly DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
        EMAIL_VERIFICATION: { maxRequests: 3, windowMs: 300000 }, // 5 min
        PASSWORD_RESET: { maxRequests: 3, windowMs: 300000 }, // 5 min
        LOGIN_ATTEMPT: { maxRequests: 5, windowMs: 900000 }, // 15 min
        API_CALL: { maxRequests: 100, windowMs: 60000 }, // 1 min
    };

    constructor(@Inject(CACHE_MANAGER) private readonly cacheService: Cache) {}

    private getRateLimitKey(identifier: string, type: string): string {
        return `ratelimit:${type}:${identifier.toLowerCase()}`;
    }

    async checkRateLimit(
        identifier: string,
        type: string,
        config?: Partial<RateLimitConfig>,
    ): Promise<void> {
        const { maxRequests, windowMs } = {
            ...this.DEFAULT_CONFIGS[type],
            ...config,
        };

        if (!maxRequests || !windowMs) {
            throw new Error(
                `Invalid rate limit configuration for type: ${type}`,
            );
        }

        const key = this.getRateLimitKey(identifier, type);
        const current = (await this.cacheService.get<number>(key)) || 0;

        const secondsLeft = Math.ceil(windowMs / 1000);

        if (current >= maxRequests) {
            throw new ThrottlerException(
                `Too many requests. Please try again in ${secondsLeft} second${secondsLeft > 1 ? 's' : ''}.`,
            );
        }

        await this.cacheService.set(key, current + 1, windowMs);
    }

    async clearRateLimit(identifier: string, type: string): Promise<void> {
        const key = this.getRateLimitKey(identifier, type);
        await this.cacheService.del(key);
    }

    async getRemainingRequests(
        identifier: string,
        type: string,
    ): Promise<number> {
        const config = this.DEFAULT_CONFIGS[type];
        if (!config) return 0;

        const key = this.getRateLimitKey(identifier, type);
        const current = (await this.cacheService.get<number>(key)) || 0;
        return Math.max(0, config.maxRequests - current);
    }
}
