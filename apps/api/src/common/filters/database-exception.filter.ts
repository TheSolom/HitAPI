import {
    Catch,
    ExceptionFilter,
    ArgumentsHost,
    HttpStatus,
} from '@nestjs/common';
import type { DatabaseError } from 'pg';
import { QueryFailedError } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import type { Response, Request } from 'express';
import { hrtime } from 'node:process';
import { STATUS_CODES } from 'node:http';
import type { EnvironmentVariablesDto } from '../../config/env/dto/environment-variables.dto.js';
import { Environment } from '../enums/environment.enum.js';
import { AppLoggerService } from '../../modules/logger/logger.service.js';
import type { AppClsStore } from '../../modules/logger/interfaces/logger.interface.js';
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
    constructor(
        private readonly logger: AppLoggerService,
        private readonly cls: ClsService<AppClsStore>,
        private readonly config: ConfigService<EnvironmentVariablesDto, true>,
    ) {
        this.logger.setContext(PostgresExceptionFilter.name);
    }

    catch(exception: QueryFailedError<DatabaseError>, host: ArgumentsHost) {
        const httpCtx = host.switchToHttp();
        const req = httpCtx.getRequest<Request>();
        const res = httpCtx.getResponse<Response>();

        const traceId = this.cls.get('traceId');
        const { method, originalUrl: path } = req;
        const durationMs = Number(
            (hrtime.bigint() - this.cls.get('startTime')) / 1_000_000n,
        );
        const { statusCode } = res;
        const logMessage = `${method} ${path} ${statusCode} - ${durationMs}ms`;

        const logMeta = {
            userId: req.user?.id,
            userApp: req.userApp?.id,
            method,
            path,
            statusCode,
            duration: durationMs,
            ip: this.cls.get('ip'),
            userAgent: this.cls.get('userAgent'),
        };

        const driverError = exception.driverError;

        if (!isPostgresError(driverError)) {
            this.logger.error(
                'Database error without driver error: ' + logMessage,
                { ...logMeta, error: exception.stack },
            );

            const response: RFC9457Response = {
                title: STATUS_CODES[HttpStatus.INTERNAL_SERVER_ERROR]!,
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                detail: 'An unexpected database error occurred',
                instance: req.url,
                traceId,
            };
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
        }

        const { code, detail } = driverError;

        if (code === '23505') {
            this.logger.info(`PostgreSQL Error Code [${code}]: ` + logMessage, {
                ...logMeta,
                error: detail,
            });

            const errors = this.extractDuplicateMessage(detail);
            const response: RFC9457Response = {
                title: STATUS_CODES[HttpStatus.CONFLICT]!,
                status: HttpStatus.CONFLICT,
                detail: 'This value already exists',
                instance: req.url,
                traceId,
                errors,
            };
            return res.status(HttpStatus.CONFLICT).json(response);
        }
        if (code === '23503') {
            this.logger.info(`PostgreSQL Error Code [${code}]: ` + logMessage, {
                ...logMeta,
                error: detail,
            });

            const errors = this.extractForeignKeyMessage(detail);
            const response: RFC9457Response = {
                title: STATUS_CODES[HttpStatus.BAD_REQUEST]!,
                status: HttpStatus.BAD_REQUEST,
                detail: 'Invalid value',
                instance: req.url,
                traceId,
                errors,
            };
            return res.status(HttpStatus.BAD_REQUEST).json(response);
        }

        this.logger.error(
            `Unhandled PostgreSQL error code [${code}]: ` + logMessage,
            {
                ...logMeta,
                error: detail,
            },
        );

        const response: RFC9457Response = {
            title: STATUS_CODES[HttpStatus.INTERNAL_SERVER_ERROR]!,
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            detail:
                this.config.get<Environment>('NODE_ENV') ===
                Environment.Production
                    ? 'An unexpected database error occurred'
                    : `Database error: ${code}`,
            instance: req.url,
            traceId,
        };
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
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
