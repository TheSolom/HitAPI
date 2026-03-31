import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ThrottlerException } from '@nestjs/throttler';
import type { IRateLimitService } from './interfaces/rate-limit-service.interface.js';
import type { RateLimitConfig } from './interfaces/rate-limit-config.interface.js';
import { MailSubjects } from '../mails/enums/mails.enum.js';

type RateLimitType = MailSubjects | 'LOGIN_ATTEMPT' | 'API_CALL';

@Injectable()
export class RateLimitService implements IRateLimitService {
    private readonly DEFAULT_CONFIGS: Record<RateLimitType, RateLimitConfig> = {
        [MailSubjects.EMAIL_VERIFICATION]: {
            maxRequests: 3,
            windowMs: 300_000,
        },
        [MailSubjects.PASSWORD_RESET]: { maxRequests: 3, windowMs: 300_000 },
        LOGIN_ATTEMPT: { maxRequests: 5, windowMs: 900_000 },
        API_CALL: { maxRequests: 100, windowMs: 60_000 },
    };

    constructor(@Inject(CACHE_MANAGER) private readonly cacheService: Cache) {}

    private buildKey(identifier: string, type: RateLimitType): string {
        return `ratelimit:${type}:${identifier.toLowerCase()}`;
    }

    private resolveConfig(
        type: RateLimitType,
        overrides?: Partial<RateLimitConfig>,
    ): RateLimitConfig {
        const base = this.DEFAULT_CONFIGS[type];

        if (!base) {
            throw new Error(
                `No rate limit configuration found for type: "${type}"`,
            );
        }

        const resolved = { ...base, ...overrides };

        if (!resolved.maxRequests || !resolved.windowMs) {
            throw new Error(
                `Rate limit config for "${type}" resolved to invalid values — ` +
                    `check your overrides: ${JSON.stringify(overrides)}`,
            );
        }

        return resolved;
    }

    async checkRateLimit(
        identifier: string,
        type: RateLimitType,
        overrides?: Partial<RateLimitConfig>,
    ): Promise<void> {
        const { maxRequests, windowMs } = this.resolveConfig(type, overrides);
        const key = this.buildKey(identifier, type);
        const current = (await this.cacheService.get<number>(key)) ?? 0;

        if (current >= maxRequests) {
            let remainingMs = (await this.cacheService.ttl(key)) ?? 0;

            remainingMs = Math.max(0, remainingMs - Date.now());

            const secondsLeft = remainingMs
                ? Math.ceil(remainingMs / 1000)
                : Math.ceil(windowMs / 1000);

            throw new ThrottlerException(
                `Too many requests. Try again in ${secondsLeft} second${secondsLeft === 1 ? '' : 's'}`,
            );
        }

        await this.cacheService.set(key, current + 1, windowMs);
    }

    async getRemainingRequests(
        identifier: string,
        type: RateLimitType,
    ): Promise<number> {
        const { maxRequests } = this.resolveConfig(type);
        const key = this.buildKey(identifier, type);
        const current = (await this.cacheService.get<number>(key)) ?? 0;
        return Math.max(0, maxRequests - current);
    }

    async clearRateLimit(
        identifier: string,
        type: RateLimitType,
    ): Promise<void> {
        const key = this.buildKey(identifier, type);
        await this.cacheService.del(key);
    }
}
