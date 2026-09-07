import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ThrottlerException } from '@nestjs/throttler';
import { RateLimitService } from '../rate-limit.service.js';
import { RateLimitType } from '../enums/rate-limit.enum.js';
import { MailSubjects } from '../../mails/enums/mails.enum.js';
import { AppLoggerService } from '../../logger/logger.service.js';

describe('RateLimitService', () => {
    let service: RateLimitService;
    let loggerMock: {
        warn: jest.Mock;
        error: jest.Mock;
        info: jest.Mock;
        debug: jest.Mock;
        setContext: jest.Mock;
    };
    let cacheMock: {
        get: jest.Mock<any>;
        set: jest.Mock<any>;
        ttl: jest.Mock<any>;
        del: jest.Mock<any>;
        store?: any;
    };

    beforeEach(async () => {
        cacheMock = {
            get: jest.fn<any>(),
            set: jest.fn<any>(),
            ttl: jest.fn<any>(),
            del: jest.fn<any>(),
        };

        loggerMock = {
            warn: jest.fn(),
            error: jest.fn(),
            info: jest.fn(),
            debug: jest.fn(),
            setContext: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RateLimitService,
                {
                    provide: CACHE_MANAGER,
                    useValue: cacheMock,
                },
                {
                    provide: AppLoggerService,
                    useValue: loggerMock,
                },
            ],
        }).compile();

        service = module.get<RateLimitService>(RateLimitService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('consume', () => {
        it('should allow request and initialize timestamps when no previous record', async () => {
            cacheMock.get.mockResolvedValue(null);

            const result = await service.consume(
                'user@example.com',
                RateLimitType.API_CALL,
            );

            expect(result.isAllowed).toBe(true);
            expect(result.limit).toBe(100);
            expect(result.remaining).toBe(99);
            expect(result.retryAfterSeconds).toBe(0);
            expect(cacheMock.set).toHaveBeenCalledWith(
                'ratelimit:API_CALL:user@example.com',
                expect.objectContaining({
                    timestamps: expect.any(Array),
                }),
                60000,
            );
        });

        it('should allow request when within limit for sliding window timestamps', async () => {
            const now = Date.now();
            cacheMock.get.mockResolvedValue({
                timestamps: [now - 1000, now - 500],
            });

            const result = await service.consume(
                'user@example.com',
                RateLimitType.API_CALL,
                {
                    maxRequests: 5,
                    windowMs: 60000,
                },
            );

            expect(result.isAllowed).toBe(true);
            expect(result.remaining).toBe(2);
            expect(cacheMock.set).toHaveBeenCalled();
        });

        it('should filter out expired timestamps in sliding window', async () => {
            const now = Date.now();
            // Two expired timestamps (> 60000ms ago) and one valid
            cacheMock.get.mockResolvedValue({
                timestamps: [now - 70000, now - 65000, now - 5000],
            });

            const result = await service.consume(
                'user@example.com',
                RateLimitType.API_CALL,
                {
                    maxRequests: 3,
                    windowMs: 60000,
                },
            );

            expect(result.isAllowed).toBe(true);
            expect(result.remaining).toBe(1); // 1 valid existing + 1 new = 2 used, 1 remaining
        });

        it('should reject request and return accurate retryAfterSeconds when sliding window is full', async () => {
            const now = Date.now();
            const oldest = now - 10000;
            cacheMock.get.mockResolvedValue({
                timestamps: [oldest, now - 5000, now - 1000],
            });

            const result = await service.consume(
                'user@example.com',
                RateLimitType.API_CALL,
                {
                    maxRequests: 3,
                    windowMs: 60000,
                },
            );

            expect(result.isAllowed).toBe(false);
            expect(result.remaining).toBe(0);
            expect(result.retryAfterSeconds).toBeGreaterThanOrEqual(49);
            expect(result.retryAfterSeconds).toBeLessThanOrEqual(51);
            expect(cacheMock.set).not.toHaveBeenCalled();
        });
    });

    describe('checkRateLimit', () => {
        it('should allow request and increment cache when under limit', async () => {
            cacheMock.get.mockResolvedValue(1);

            await expect(
                service.checkRateLimit('user@example.com', 'LOGIN_ATTEMPT'),
            ).resolves.not.toThrow();

            expect(cacheMock.set).toHaveBeenCalledWith(
                'ratelimit:LOGIN_ATTEMPT:user@example.com',
                2,
                900000,
            );
        });

        it('should throw ThrottlerException when limit is exceeded', async () => {
            cacheMock.get.mockResolvedValue(5);
            cacheMock.ttl.mockResolvedValue(Date.now() + 30000);

            await expect(
                service.checkRateLimit('user@example.com', 'LOGIN_ATTEMPT'),
            ).rejects.toThrow(ThrottlerException);
            expect(cacheMock.set).not.toHaveBeenCalled();
        });

        it('should respect custom overrides', async () => {
            cacheMock.get.mockResolvedValue(1);

            await service.checkRateLimit('test-id', 'API_CALL', {
                maxRequests: 2,
                windowMs: 10000,
            });

            expect(cacheMock.set).toHaveBeenCalledWith(
                'ratelimit:API_CALL:test-id',
                2,
                10000,
            );
        });
    });

    describe('Redis Lua script execution', () => {
        it('should call redis eval when redis client is available', async () => {
            const evalMock = jest
                .fn<any>()
                .mockResolvedValue([1, 98, 60000, 0]);
            cacheMock.store = {
                client: {
                    eval: evalMock,
                },
            };

            const result = await service.consume(
                'redis-user',
                RateLimitType.API_CALL,
            );

            expect(evalMock).toHaveBeenCalled();
            expect(result.isAllowed).toBe(true);
            expect(result.remaining).toBe(98);
        });

        it('should fall back to cache when redis eval fails', async () => {
            const evalMock = jest
                .fn<any>()
                .mockRejectedValue(new Error('Redis connection lost'));
            cacheMock.store = {
                client: {
                    eval: evalMock,
                },
            };
            cacheMock.get.mockResolvedValue(null);

            const result = await service.consume(
                'redis-user',
                RateLimitType.API_CALL,
            );

            expect(evalMock).toHaveBeenCalled();
            expect(result.isAllowed).toBe(true);
            expect(result.remaining).toBe(99);
        });
    });

    describe('getRemainingRequests', () => {
        it('should return remaining requests for MailSubjects', async () => {
            cacheMock.get.mockResolvedValue(2);

            const remaining = await service.getRemainingRequests(
                'user@example.com',
                MailSubjects.PASSWORD_RESET,
            );

            // default for PASSWORD_RESET is 3. 3 - 2 = 1.
            expect(remaining).toBe(1);
        });

        it('should return 0 when requests exceed limit', async () => {
            cacheMock.get.mockResolvedValue(10);

            const remaining = await service.getRemainingRequests(
                'user@example.com',
                MailSubjects.PASSWORD_RESET,
            );

            expect(remaining).toBe(0);
        });
    });

    describe('clearRateLimit', () => {
        it('should delete rate limit key', async () => {
            await service.clearRateLimit('user@example.com', 'LOGIN_ATTEMPT');

            expect(cacheMock.del).toHaveBeenCalledWith(
                'ratelimit:LOGIN_ATTEMPT:user@example.com',
            );
        });
    });

    describe('resolveConfig', () => {
        it('should throw error when maxRequests is 0 or missing in override', () => {
            expect(() => {
                service.resolveConfig(RateLimitType.API_CALL, {
                    maxRequests: 0,
                });
            }).toThrow(
                'Rate limit config for "API_CALL" resolved to invalid values',
            );
        });
    });
});
