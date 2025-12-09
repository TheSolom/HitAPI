import {
    Catch,
    ExceptionFilter,
    ArgumentsHost,
    HttpStatus,
} from '@nestjs/common';
import { DatabaseError } from 'pg';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

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
    catch(exception: QueryFailedError<DatabaseError>, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();

        const driverError = exception.driverError;

        if (!isPostgresError(driverError)) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Internal server error',
                error: 'Internal Server Error',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            });
            return;
        }

        const { code, detail } = driverError;

        if (code === '23505') {
            response.status(HttpStatus.CONFLICT).json({
                message: this.extractDuplicateMessage(detail),
                error: 'Conflict',
                statusCode: HttpStatus.CONFLICT,
            });
        } else if (code === '23503') {
            response.status(HttpStatus.BAD_REQUEST).json({
                message: this.extractForeignKeyMessage(detail),
                error: 'Bad Request',
                statusCode: HttpStatus.BAD_REQUEST,
            });
        } else {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Internal server error',
                error: 'Internal Server Error',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }

    private extractDuplicateMessage(detail: string): string {
        if (!detail) {
            return 'Duplicate data';
        }

        const regex: RegExp = /\((\w+)\)[^)]*\((\w+)\)/;
        const match = regex.exec(detail);
        return match ? `${match[2]} already exists` : 'Duplicate data';
    }

    private extractForeignKeyMessage(detail: string): string {
        if (!detail) {
            return 'Invalid data';
        }

        const regex: RegExp = /\((\w+)\)/;
        const match = regex.exec(detail);
        return match ? `Invalid ${match[1]}` : 'Invalid data';
    }
}
