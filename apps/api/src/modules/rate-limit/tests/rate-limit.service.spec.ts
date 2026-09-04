import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ThrottlerException } from '@nestjs/throttler';
import { RateLimitService } from '../rate-limit.service.js';
import { MailSubjects } from '../../mails/enums/mails.enum.js';

describe('RateLimitService', () => {
    let service: RateLimitService;
    let cacheMock: {
        get: jest.Mock<any>;
        set: jest.Mock<any>;
        ttl: jest.Mock<any>;
        del: jest.Mock<any>;
    };

    beforeEach(async () => {
        cacheMock = {
            get: jest.fn<any>(),
            set: jest.fn<any>(),
            ttl: jest.fn<any>(),
            del: jest.fn<any>(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RateLimitService,
                {
                    provide: CACHE_MANAGER,
                    useValue: cacheMock,
                },
            ],
        }).compile();

        service = module.get<RateLimitService>(RateLimitService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
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

    describe('getRemainingRequests', () => {
        it('should return remaining requests', async () => {
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
});
