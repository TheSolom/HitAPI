import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ThrottlerException } from '@nestjs/throttler';
import type { IRateLimitService } from './interfaces/rate-limit-service.interface.js';
import type { RateLimitConfig } from './interfaces/rate-limit-config.interface.js';
import type { RateLimitResult } from './interfaces/rate-limit-result.interface.js';
import type { IRateLimitStorage } from './interfaces/rate-limit-storage.interface.js';
import { RateLimitType } from './enums/rate-limit.enum.js';
import { DEFAULT_RATE_LIMIT_CONFIGS } from './constants/rate-limit.constant.js';
import {
    RedisSlidingWindowStorage,
    type RedisClientContract,
} from './storage/redis-sliding-window.storage.js';
import { CacheSlidingWindowStorage } from './storage/cache-sliding-window.storage.js';
import { AppLoggerService } from '../logger/logger.service.js';

@Injectable()
export class RateLimitService implements IRateLimitService {
    private readonly fallbackStorage: CacheSlidingWindowStorage;

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
        private readonly logger: AppLoggerService,
    ) {
        this.logger.setContext(RateLimitService.name);
        this.fallbackStorage = new CacheSlidingWindowStorage(this.cacheService);
    }

    private normalizeType(
        type: RateLimitType | string,
    ): RateLimitType | string {
        const typeStr = type.toUpperCase();
        switch (typeStr) {
            case 'EMAIL_VERIFICATION':
                return RateLimitType.EMAIL_VERIFICATION;
            case 'PASSWORD_RESET':
                return RateLimitType.PASSWORD_RESET;
            case 'LOGIN_ATTEMPT':
                return RateLimitType.LOGIN_ATTEMPT;
            case 'API_CALL':
                return RateLimitType.API_CALL;
            default:
                return type;
        }
    }

    private buildKey(identifier: string, type: RateLimitType | string): string {
        const normalized = this.normalizeType(type);
        return `ratelimit:${normalized}:${identifier.toLowerCase()}`;
    }

    resolveConfig(
        type: RateLimitType | string,
        overrides?: Partial<RateLimitConfig>,
    ): RateLimitConfig {
        const normalized = this.normalizeType(type);
        const configs = DEFAULT_RATE_LIMIT_CONFIGS as Record<
            string,
            RateLimitConfig | undefined
        >;
        const base =
            configs[normalized] ??
            DEFAULT_RATE_LIMIT_CONFIGS[RateLimitType.API_CALL];

        const resolved = { ...base, ...overrides };

        if (!resolved.maxRequests || !resolved.windowMs) {
            throw new Error(
                `Rate limit config for "${type}" resolved to invalid values — ` +
                    `check your overrides: ${JSON.stringify(overrides)}`,
            );
        }

        return resolved;
    }

    private getRedisClient(): RedisClientContract | null {
        const cacheObj = this.cacheService as unknown;
        if (!cacheObj || typeof cacheObj !== 'object') {
            return null;
        }

        const record = cacheObj as Record<string, unknown>;
        const store = record.store as Record<string, unknown> | undefined;
        const opts = store?.opts as Record<string, unknown> | undefined;
        const optsStore = opts?.store as Record<string, unknown> | undefined;

        const candidate =
            store?.client ??
            optsStore?.client ??
            optsStore?.redis ??
            store?.redis ??
            record.client;

        if (
            candidate &&
            typeof candidate === 'object' &&
            'eval' in candidate &&
            typeof (candidate as Record<string, unknown>).eval === 'function'
        ) {
            return candidate as unknown as RedisClientContract;
        }

        return null;
    }

    private getStorage(): {
        storage: IRateLimitStorage;
        isRedis: boolean;
    } {
        const redisClient = this.getRedisClient();
        if (redisClient) {
            return {
                storage: new RedisSlidingWindowStorage(redisClient),
                isRedis: true,
            };
        }

        return {
            storage: this.fallbackStorage,
            isRedis: false,
        };
    }

    async consume(
        identifier: string,
        type: RateLimitType | string,
        overrides?: Partial<RateLimitConfig>,
    ): Promise<RateLimitResult> {
        const { maxRequests, windowMs } = this.resolveConfig(type, overrides);
        const key = this.buildKey(identifier, type);
        const { storage, isRedis } = this.getStorage();

        if (isRedis) {
            try {
                return await storage.consume(key, maxRequests, windowMs);
            } catch (error: unknown) {
                this.logger.warn(
                    `Redis sliding window execution failed, falling back to cache store: ${String(error)}`,
                );
            }
        }

        return this.fallbackStorage.consume(key, maxRequests, windowMs);
    }

    async checkRateLimit(
        identifier: string,
        type: RateLimitType | string,
        overrides?: Partial<RateLimitConfig>,
    ): Promise<RateLimitResult> {
        const result = await this.consume(identifier, type, overrides);

        if (!result.isAllowed) {
            const secondsLeft = String(result.retryAfterSeconds);
            throw new ThrottlerException(
                `Too many requests. Try again in ${secondsLeft} second${result.retryAfterSeconds === 1 ? '' : 's'}`,
            );
        }

        return result;
    }

    async getRemainingRequests(
        identifier: string,
        type: RateLimitType | string,
        overrides?: Partial<RateLimitConfig>,
    ): Promise<number> {
        const { maxRequests, windowMs } = this.resolveConfig(type, overrides);
        const key = this.buildKey(identifier, type);
        const { storage, isRedis } = this.getStorage();

        if (isRedis) {
            try {
                return await storage.getRemaining(key, maxRequests, windowMs);
            } catch (error: unknown) {
                this.logger.warn(`Redis getRemaining failed: ${String(error)}`);
            }
        }

        return this.fallbackStorage.getRemaining(key, maxRequests, windowMs);
    }

    async clearRateLimit(
        identifier: string,
        type: RateLimitType | string,
    ): Promise<void> {
        const key = this.buildKey(identifier, type);
        const { storage, isRedis } = this.getStorage();

        if (isRedis) {
            try {
                await storage.clear(key);
            } catch (error: unknown) {
                this.logger.warn(`Redis clear failed: ${String(error)}`);
            }
        }

        await this.fallbackStorage.clear(key);
    }
}
