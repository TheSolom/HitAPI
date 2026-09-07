import {
    Injectable,
    CanActivate,
    ExecutionContext,
    Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerException } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { getClientIp } from 'request-ip';
import { Services } from '../../../common/constants/services.constant.js';
import type { IRateLimitService } from '../interfaces/rate-limit-service.interface.js';
import type { RateLimitOptions } from '../interfaces/rate-limit-config.interface.js';
import { RateLimitTracker, RateLimitType } from '../enums/rate-limit.enum.js';
import {
    RATE_LIMIT_METADATA_KEY,
    SKIP_RATE_LIMIT_METADATA_KEY,
} from '../decorators/rate-limit.decorator.js';
import { AppLoggerService } from '../../logger/logger.service.js';

@Injectable()
export class RateLimitGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @Inject(Services.RATE_LIMIT)
        private readonly rateLimitService: IRateLimitService,
        private readonly logger: AppLoggerService,
    ) {
        this.logger.setContext(RateLimitGuard.name);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isSkipped = this.reflector.getAllAndOverride<boolean | undefined>(
            SKIP_RATE_LIMIT_METADATA_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (isSkipped) {
            return true;
        }

        const options = this.reflector.getAllAndOverride<
            RateLimitOptions | undefined
        >(RATE_LIMIT_METADATA_KEY, [context.getHandler(), context.getClass()]);

        if (!options) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();

        const identifier = await this.resolveIdentifier(
            context,
            request,
            options,
        );
        const rateLimitType = options.type ?? RateLimitType.API_CALL;

        const result = await this.rateLimitService.consume(
            identifier,
            rateLimitType,
            options,
        );

        if (typeof response.setHeader === 'function') {
            const resetSeconds = Math.ceil(result.resetMs / 1000);

            // RFC / draft-ietf headers
            response.setHeader('RateLimit-Limit', result.limit);
            response.setHeader('RateLimit-Remaining', result.remaining);
            response.setHeader('RateLimit-Reset', resetSeconds);

            // Legacy X-RateLimit headers
            response.setHeader('X-RateLimit-Limit', result.limit);
            response.setHeader('X-RateLimit-Remaining', result.remaining);
            response.setHeader(
                'X-RateLimit-Reset',
                Math.ceil((Date.now() + result.resetMs) / 1000),
            );

            if (!result.isAllowed) {
                response.setHeader('Retry-After', result.retryAfterSeconds);
            }
        }

        if (!result.isAllowed) {
            this.logger.warn(
                `Rate limit exceeded for identifier "${identifier}" on type "${rateLimitType}". Retry after ${String(result.retryAfterSeconds)}s`,
            );
            const secondsLeft = String(result.retryAfterSeconds);
            const message =
                options.errorMessage ??
                `Too many requests. Try again in ${secondsLeft} second${result.retryAfterSeconds === 1 ? '' : 's'}`;
            throw new ThrottlerException(message);
        }

        return true;
    }

    private async resolveIdentifier(
        context: ExecutionContext,
        request: Request,
        options: RateLimitOptions,
    ): Promise<string> {
        if (options.keyExtractor) {
            return options.keyExtractor(context);
        }

        const tracker = options.tracker ?? RateLimitTracker.IP;

        switch (tracker) {
            case RateLimitTracker.APP: {
                const headerClientId = request.headers['x-client-id'];
                const clientId =
                    typeof headerClientId === 'string'
                        ? headerClientId
                        : undefined;
                return (
                    request.userApp?.id ??
                    clientId ??
                    this.getClientIpAddress(request)
                );
            }
            case RateLimitTracker.USER:
                return request.user?.id ?? this.getClientIpAddress(request);
            case RateLimitTracker.IP:
            default:
                return this.getClientIpAddress(request);
        }
    }

    private getClientIpAddress(request: Request): string {
        return getClientIp(request) ?? request.ip ?? 'unknown';
    }
}
