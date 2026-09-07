/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerException } from '@nestjs/throttler';
import { RateLimitGuard } from '../guards/rate-limit.guard.js';
import type { IRateLimitService } from '../interfaces/rate-limit-service.interface.js';
import { RateLimitTracker, RateLimitType } from '../enums/rate-limit.enum.js';
import {
    RATE_LIMIT_METADATA_KEY,
    SKIP_RATE_LIMIT_METADATA_KEY,
} from '../decorators/rate-limit.decorator.js';
import { AppLoggerService } from '../../logger/logger.service.js';

describe('RateLimitGuard', () => {
    let guard: RateLimitGuard;
    let reflector: Reflector;
    let getAllAndOverrideSpy: jest.SpiedFunction<
        Reflector['getAllAndOverride']
    >;
    let rateLimitService: jest.Mocked<IRateLimitService>;
    let loggerMock: {
        warn: jest.Mock;
        error: jest.Mock;
        info: jest.Mock;
        debug: jest.Mock;
        setContext: jest.Mock;
    };

    beforeEach(() => {
        reflector = new Reflector();
        getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride');

        rateLimitService = {
            consume: jest.fn<any>(),
            checkRateLimit: jest.fn<any>(),
            clearRateLimit: jest.fn<any>(),
            getRemainingRequests: jest.fn<any>(),
            resolveConfig: jest.fn<any>(),
        };

        loggerMock = {
            warn: jest.fn(),
            error: jest.fn(),
            info: jest.fn(),
            debug: jest.fn(),
            setContext: jest.fn(),
        };

        guard = new RateLimitGuard(
            reflector,
            rateLimitService,
            loggerMock as unknown as AppLoggerService,
        );
    });

    const createMockContext = (
        requestOverride: Record<string, unknown> = {},
    ): {
        context: ExecutionContext;
        req: Record<string, unknown>;
        res: Record<string, unknown>;
    } => {
        const headers: Record<string, string> = {};
        const req: Record<string, unknown> = {
            headers: {},
            ip: '127.0.0.1',
            ...requestOverride,
        };
        const res: Record<string, unknown> = {
            setHeader: jest.fn((name: string, value: unknown) => {
                headers[name] = String(value);
            }),
            getHeader: (name: string) => headers[name],
        };

        const context = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: () => ({
                getRequest: () => req,
                getResponse: () => res,
            }),
        } as unknown as ExecutionContext;

        return { context, req, res };
    };

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should allow request when SkipRateLimit is true', async () => {
        const { context } = createMockContext();
        getAllAndOverrideSpy.mockImplementation((key: unknown) => {
            if (String(key) === SKIP_RATE_LIMIT_METADATA_KEY) return true;
            return null;
        });

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(rateLimitService.consume).not.toHaveBeenCalled();
    });

    it('should allow request when no RateLimit metadata is set', async () => {
        const { context } = createMockContext();
        getAllAndOverrideSpy.mockReturnValue(null);

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(rateLimitService.consume).not.toHaveBeenCalled();
    });

    it('should allow request and set RFC & legacy headers when within limit', async () => {
        const { context, res } = createMockContext();
        getAllAndOverrideSpy.mockImplementation((key: unknown) => {
            if (String(key) === RATE_LIMIT_METADATA_KEY) {
                return {
                    type: RateLimitType.API_CALL,
                    tracker: RateLimitTracker.IP,
                };
            }
            return false;
        });

        rateLimitService.consume.mockResolvedValue({
            isAllowed: true,
            limit: 100,
            remaining: 99,
            resetMs: 60000,
            retryAfterSeconds: 0,
        });

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(res.setHeader).toHaveBeenCalledWith('RateLimit-Limit', 100);
        expect(res.setHeader).toHaveBeenCalledWith('RateLimit-Remaining', 99);
        expect(res.setHeader).toHaveBeenCalledWith('RateLimit-Reset', 60);
        expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 100);
        expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 99);
    });

    it('should set Retry-After and throw ThrottlerException when limit exceeded', async () => {
        const { context, res } = createMockContext();
        getAllAndOverrideSpy.mockImplementation((key: unknown) => {
            if (String(key) === RATE_LIMIT_METADATA_KEY) {
                return {
                    type: RateLimitType.API_CALL,
                    tracker: RateLimitTracker.IP,
                };
            }
            return false;
        });

        rateLimitService.consume.mockResolvedValue({
            isAllowed: false,
            limit: 100,
            remaining: 0,
            resetMs: 45000,
            retryAfterSeconds: 45,
        });

        await expect(guard.canActivate(context)).rejects.toThrow(
            ThrottlerException,
        );
        expect(res.setHeader).toHaveBeenCalledWith('Retry-After', 45);
    });

    it('should resolve identifier from userApp for RateLimitTracker.APP', async () => {
        const { context } = createMockContext({
            userApp: { id: 'app-uuid-123' },
        });

        getAllAndOverrideSpy.mockImplementation((key: unknown) => {
            if (String(key) === RATE_LIMIT_METADATA_KEY) {
                return {
                    type: RateLimitType.API_CALL,
                    tracker: RateLimitTracker.APP,
                };
            }
            return false;
        });

        rateLimitService.consume.mockResolvedValue({
            isAllowed: true,
            limit: 100,
            remaining: 99,
            resetMs: 60000,
            retryAfterSeconds: 0,
        });

        await guard.canActivate(context);

        expect(rateLimitService.consume).toHaveBeenCalledWith(
            'app-uuid-123',
            RateLimitType.API_CALL,
            expect.any(Object),
        );
    });

    it('should resolve identifier from user for RateLimitTracker.USER', async () => {
        const { context } = createMockContext({
            user: { id: 'user-uuid-456' },
        });

        getAllAndOverrideSpy.mockImplementation((key: unknown) => {
            if (String(key) === RATE_LIMIT_METADATA_KEY) {
                return {
                    type: RateLimitType.API_CALL,
                    tracker: RateLimitTracker.USER,
                };
            }
            return false;
        });

        rateLimitService.consume.mockResolvedValue({
            isAllowed: true,
            limit: 100,
            remaining: 99,
            resetMs: 60000,
            retryAfterSeconds: 0,
        });

        await guard.canActivate(context);

        expect(rateLimitService.consume).toHaveBeenCalledWith(
            'user-uuid-456',
            RateLimitType.API_CALL,
            expect.any(Object),
        );
    });

    it('should support custom keyExtractor', async () => {
        const { context } = createMockContext({
            customKey: 'tenant-999',
        });

        getAllAndOverrideSpy.mockImplementation((key: unknown) => {
            if (String(key) === RATE_LIMIT_METADATA_KEY) {
                return {
                    type: RateLimitType.API_CALL,
                    keyExtractor: (ctx: ExecutionContext) =>
                        ctx.switchToHttp().getRequest<{ customKey: string }>()
                            .customKey,
                };
            }
            return false;
        });

        rateLimitService.consume.mockResolvedValue({
            isAllowed: true,
            limit: 100,
            remaining: 99,
            resetMs: 60000,
            retryAfterSeconds: 0,
        });

        await guard.canActivate(context);

        expect(rateLimitService.consume).toHaveBeenCalledWith(
            'tenant-999',
            RateLimitType.API_CALL,
            expect.any(Object),
        );
    });
});
