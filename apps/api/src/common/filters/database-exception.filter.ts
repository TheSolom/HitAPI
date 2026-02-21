import {
    Catch,
    ExceptionFilter,
    ArgumentsHost,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { QueryFailedError } from 'typeorm';
import type { DatabaseError } from 'pg';
import type { Response, Request } from 'express';
import type { RFC9457Response } from '../interfaces/RFC9457-response.interface.js';

interface PostgresError extends DatabaseError {
    code: string;
    detail: string;
}

function isPostgresError(error: unknown): error is PostgresError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as Record<string, unknown>).code === 'string' &&
        'detail' in error &&
        typeof (error as Record<string, unknown>).detail === 'string'
    );
}

@Catch(QueryFailedError<DatabaseError>)
export class PostgresExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(PostgresExceptionFilter.name);
    private readonly IS_PRODUCTION =
        new ConfigService().get<string>('NODE_ENV') === 'production';

    catch(exception: QueryFailedError<DatabaseError>, host: ArgumentsHost) {
        const req = host.switchToHttp().getRequest<Request>();
        const res = host.switchToHttp().getResponse<Response>();

        const traceId = (req.headers['x-trace-id'] as string) || randomUUID();
        const driverError = exception.driverError;

        if (!isPostgresError(driverError)) {
            this.logger.error(
                `[${traceId}] [${req.method}] ${req.url} - Database error without driver error`,
                exception.stack,
            );

            const response: RFC9457Response = {
                title: 'Internal Server Error',
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                detail: 'An unexpected database error occurred',
                instance: req.url,
                traceId,
            };
            res.setHeader('X-Trace-Id', traceId);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
            return;
        }

        const { code, detail } = driverError;

        this.logger.warn(
            `[${traceId}] [${req.method}] ${req.url} - PostgreSQL Error Code: ${code}`,
            this.IS_PRODUCTION ? undefined : detail,
        );

        if (code === '23505') {
            const errors = this.extractDuplicateMessage(detail);
            const response: RFC9457Response = {
                title: 'Conflict',
                status: HttpStatus.CONFLICT,
                detail: 'A unique constraint violation occurred',
                instance: req.url,
                traceId,
                errors,
            };

            this.logger.warn(
                `[${traceId}] Unique constraint violation: ${JSON.stringify(errors)}`,
            );

            res.setHeader('X-Trace-Id', traceId);
            res.status(HttpStatus.CONFLICT).json(response);
        } else if (code === '23503') {
            const errors = this.extractForeignKeyMessage(detail);
            const response: RFC9457Response = {
                title: 'Bad Request',
                status: HttpStatus.BAD_REQUEST,
                detail: 'A foreign key constraint violation occurred',
                instance: req.url,
                traceId,
                errors,
            };

            this.logger.warn(
                `[${traceId}] Foreign key constraint violation: ${JSON.stringify(errors)}`,
            );

            res.setHeader('X-Trace-Id', traceId);
            res.status(HttpStatus.BAD_REQUEST).json(response);
        } else {
            this.logger.error(
                `[${traceId}] [${req.method}] ${req.url} - Unhandled PostgreSQL error code: ${code}`,
                this.IS_PRODUCTION ? undefined : detail,
            );

            const response: RFC9457Response = {
                title: 'Internal Server Error',
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                detail: this.IS_PRODUCTION
                    ? 'An unexpected database error occurred'
                    : `Database error: ${code}`,
                instance: req.url,
                traceId,
            };
            res.setHeader('X-Trace-Id', traceId);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
        }
    }

    private extractDuplicateMessage(
        detail: string,
    ): Array<{ field: string; detail: string }> {
        if (!detail) {
            return [{ field: 'unknown', detail: 'Duplicate data' }];
        }

        const regex: RegExp = /Key\s*\(([^)]+)\)=\(([^)]+)\)/;
        const match = regex.exec(detail);

        if (match) {
            const keys = match[1]
                .split(',')
                .map((k) => k.trim().replaceAll(/(?:^")|(?:"$)/g, ''));
            const values = match[2].split(',').map((v) => v.trim());

            const index = keys.length > 1 ? keys.length - 1 : 0;

            return [
                {
                    field: keys[index],
                    detail: `${values[index]} already exists`,
                },
            ];
        }

        return [{ field: 'unknown', detail: 'Duplicate data' }];
    }

    private extractForeignKeyMessage(
        detail: string,
    ): Array<{ field: string; detail: string }> {
        if (!detail) {
            return [{ field: 'unknown', detail: 'Invalid data' }];
        }

        const regex: RegExp = /\((\w+)\)/;
        const match = regex.exec(detail);

        if (match) {
            return [
                {
                    field: match[1],
                    detail: `Invalid ${match[1]}`,
                },
            ];
        }

        return [{ field: 'unknown', detail: 'Invalid data' }];
    }
}
