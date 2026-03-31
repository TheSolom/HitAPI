import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { hrtime } from 'node:process';
import { STATUS_CODES } from 'node:http';
import type { Request, Response } from 'express';
import { AppLoggerService } from '../../modules/logger/logger.service.js';
import type { EnvironmentVariablesDto } from '../../config/env/dto/environment-variables.dto.js';
import { Environment } from '../enums/environment.enum.js';
import type {
    AppClsStore,
    LogMeta,
} from '../../modules/logger/interfaces/logger.interface.js';
import type {
    RFC9457Response,
    ValidationErrorDetail,
} from '../../common/interfaces/RFC9457-response.interface.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly cls: ClsService<AppClsStore>,
        private readonly config: ConfigService<EnvironmentVariablesDto, true>,
    ) {
        this.logger.setContext(GlobalExceptionFilter.name);
    }

    catch(exception: unknown, host: ArgumentsHost): void {
        const httpCtx = host.switchToHttp();
        const req = httpCtx.getRequest<Request>();
        const res = httpCtx.getResponse<Response>();

        const { statusCode, response } = this.parseException(
            exception,
            req.url,
        );

        this.logException(exception, req);

        res.status(statusCode).json(response);
    }

    private logException(exception: unknown, req: Request): void {
        const statusCode =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;
        const isServerError =
            <number>HttpStatus.INTERNAL_SERVER_ERROR <= statusCode;
        const isClientError =
            <number>HttpStatus.BAD_REQUEST <= statusCode &&
            <number>HttpStatus.INTERNAL_SERVER_ERROR > statusCode;

        const { method, originalUrl: path } = req;
        const durationMs = Number(
            (hrtime.bigint() - (this.cls.get('startTime') ?? 0n)) / 1_000_000n,
        );
        const logMessage = `${method} ${path} ${statusCode} - ${durationMs}ms`;

        const logMeta: LogMeta = {
            userId: req.user?.id,
            userApp: req.userApp?.id,
            method,
            path,
            statusCode,
            duration: durationMs,
            ip: this.cls.get('ip'),
            userAgent: this.cls.get('userAgent'),
        };

        if (isServerError) {
            return this.logger.error('Unhandled exception: ' + logMessage, {
                ...logMeta,
                error:
                    exception instanceof Error
                        ? exception.stack
                        : JSON.stringify(exception),
            });
        }

        if (isClientError && <number>HttpStatus.NOT_FOUND !== statusCode) {
            if (
                <number>HttpStatus.UNAUTHORIZED == statusCode ||
                <number>HttpStatus.FORBIDDEN === statusCode
            ) {
                return this.logger.warn('Auth failure: ' + logMessage, logMeta);
            }
            if (<number>HttpStatus.TOO_MANY_REQUESTS === statusCode) {
                return this.logger.warn(
                    'Rate limit hit: ' + logMessage,
                    logMeta,
                );
            }
            return this.logger.debug('Client error: ' + logMessage, logMeta);
        }
    }

    private parseException(
        exception: unknown,
        url: string,
    ): {
        statusCode: number;
        response: RFC9457Response;
    } {
        const traceId = this.cls.get('traceId');

        if (exception instanceof HttpException) {
            return this.handleHttpException(exception, url, traceId);
        }
        if (exception instanceof Error) {
            return this.handleError(exception, url, traceId);
        }

        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            response: {
                title: STATUS_CODES[HttpStatus.INTERNAL_SERVER_ERROR]!,
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                detail: 'An unexpected error occurred',
                instance: url,
                traceId,
            },
        };
    }

    private handleHttpException(
        exception: HttpException,
        url: string,
        traceId: string,
    ): {
        statusCode: number;
        response: RFC9457Response;
    } {
        const statusCode = exception.getStatus();
        const exceptionResponse = exception.getResponse() as Record<
            string,
            unknown
        >;

        if (
            statusCode === <number>HttpStatus.BAD_REQUEST &&
            Array.isArray(exceptionResponse.message)
        ) {
            return {
                statusCode,
                response: {
                    title: 'Validation Failed',
                    status: statusCode,
                    detail: 'Request validation failed. See errors for details',
                    instance: url,
                    traceId,
                    errors: this.formatValidationErrors(
                        exceptionResponse.message as Array<
                            Record<string, unknown>
                        >,
                    ),
                },
            };
        }

        const title = STATUS_CODES[statusCode] ?? 'HTTP Error';
        const detail = this.extractErrorMessage(exceptionResponse, exception);

        return {
            statusCode,
            response: {
                title,
                status: statusCode,
                detail,
                instance: url,
                traceId,
            },
        };
    }

    private handleError(
        error: Error,
        url: string,
        traceId: string,
    ): {
        statusCode: number;
        response: RFC9457Response;
    } {
        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            response: {
                title: STATUS_CODES[HttpStatus.INTERNAL_SERVER_ERROR]!,
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                detail:
                    this.config.get<Environment>('NODE_ENV') ===
                    Environment.Production
                        ? 'An unexpected error occurred'
                        : error.message,
                instance: url,
                traceId,
            },
        };
    }

    private extractErrorMessage(
        response: Record<string, unknown>,
        exception: HttpException,
    ): string {
        if (typeof response.message === 'string') {
            return response.message;
        }

        if (typeof response.error === 'string') {
            return response.error;
        }

        return exception.message || 'An error occurred';
    }

    private formatValidationErrors(
        errors: Array<Record<string, unknown>>,
    ): RFC9457Response['errors'] {
        const flattenedErrors: ValidationErrorDetail[] = [];

        for (const error of errors) {
            this.flattenValidationError(error, '', flattenedErrors);
        }

        return flattenedErrors;
    }

    private flattenValidationError(
        error: Record<string, unknown>,
        parentPath: string,
        result: ValidationErrorDetail[],
    ): void {
        const property = error.property as string;
        const currentPath = parentPath ? `${parentPath}.${property}` : property;

        // If this error has constraints, add them
        if (error.constraints && typeof error.constraints === 'object') {
            const detail = Object.values(
                error.constraints as Record<string, string>,
            ).join('; ');
            result.push({
                field: currentPath,
                detail,
            });
        }

        // If this error has children, recurse into them
        if (Array.isArray(error.children)) {
            for (const child of error.children) {
                this.flattenValidationError(
                    child as Record<string, unknown>,
                    currentPath,
                    result,
                );
            }
        }

        // If no constraints and no children, it's a parent-only error
        if (
            !error.constraints &&
            (!Array.isArray(error.children) || error.children.length === 0)
        ) {
            result.push({
                field: currentPath,
                detail: (error.message as string) || 'Validation failed',
            });
        }
    }
}
