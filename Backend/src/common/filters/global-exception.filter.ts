import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import type {
    RFC9457Response,
    ValidationErrorDetail,
} from '../../common/interfaces/RFC9457-response.interface.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);
    private readonly IS_PRODUCTION =
        new ConfigService().get<string>('NODE_ENV') === 'production';

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();

        const traceId = (req.headers['x-trace-id'] as string) || randomUUID();
        res.setHeader('X-Trace-Id', traceId);

        const { statusCode, response } = this.parseException(
            exception,
            req.url,
            traceId,
        );

        this.logException(exception, req, statusCode, traceId);

        res.status(statusCode).json(response);
    }

    private logException(
        exception: unknown,
        req: Request,
        statusCode: number,
        traceId: string,
    ): void {
        const isClientError = statusCode >= 400 && statusCode < 500;
        const isServerError = statusCode >= 500;

        const logMessage = `[${traceId}] [${req.method}] ${req.url} - ${statusCode}`;

        if (isServerError) {
            this.logger.error(
                logMessage,
                exception instanceof Error
                    ? exception.stack
                    : JSON.stringify(exception),
            );
        } else if (isClientError && statusCode !== 404) {
            this.logger.warn(logMessage);
        }
    }

    private parseException(
        exception: unknown,
        url: string,
        traceId: string,
    ): {
        statusCode: number;
        response: RFC9457Response;
    } {
        if (exception instanceof HttpException) {
            return this.handleHttpException(exception, url, traceId);
        }

        if (exception instanceof Error) {
            return this.handleError(exception, url, traceId);
        }

        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            response: {
                title: 'Internal Server Error',
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
            statusCode === (HttpStatus.BAD_REQUEST as number) &&
            Array.isArray(exceptionResponse.message)
        ) {
            return {
                statusCode,
                response: {
                    title: 'Validation Failed',
                    status: statusCode,
                    detail: 'Request validation failed. See errors for details.',
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

        const title = this.getHttpStatusTitle(statusCode);
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
                title: 'Internal Server Error',
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                detail: this.IS_PRODUCTION
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

    private getHttpStatusTitle(status: number): string {
        const titles: Record<number, string> = {
            [HttpStatus.BAD_REQUEST]: 'Bad Request',
            [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
            [HttpStatus.FORBIDDEN]: 'Forbidden',
            [HttpStatus.NOT_FOUND]: 'Not Found',
            [HttpStatus.CONFLICT]: 'Conflict',
            [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
            [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
            [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
        };

        return titles[status] || 'HTTP Error';
    }
}
