import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpStatus,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Observable, tap } from 'rxjs';
import type { Request, Response } from 'express';
import { hrtime } from 'node:process';
import { AppLoggerService } from '../../modules/logger/logger.service.js';
import type { AppClsStore } from '../../modules/logger/interfaces/logger.interface.js';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly cls: ClsService<AppClsStore>,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const httpCtx = context.switchToHttp();
        const req = httpCtx.getRequest<Request>();
        const res = httpCtx.getResponse<Response>();

        return next.handle().pipe(
            tap({
                next: () => this.logRequest(req, res),
                error: () => this.logRequest(req, res),
            }),
        );
    }

    private logRequest(req: Request, res: Response): void {
        const { method, originalUrl: path } = req;
        const { statusCode } = res;
        const durationMs = Number(
            (hrtime.bigint() - this.cls.get('startTime')) / 1_000_000n,
        );

        const logData = {
            userId: req.user?.id,
            userApp: req.userApp?.id,
            method,
            path,
            statusCode,
            duration: durationMs,
            ip: this.cls.get('ip'),
            userAgent: this.cls.get('userAgent'),
        };

        const logMessage = `${method} ${path} ${statusCode} - ${durationMs}ms`;

        if (<number>HttpStatus.INTERNAL_SERVER_ERROR <= statusCode) {
            return this.logger.error(logMessage, logData);
        }
        if (
            <number>HttpStatus.BAD_REQUEST <= statusCode &&
            <number>HttpStatus.INTERNAL_SERVER_ERROR > statusCode
        ) {
            return this.logger.warn(logMessage, logData);
        }
        return this.logger.info(logMessage, logData);
    }
}
