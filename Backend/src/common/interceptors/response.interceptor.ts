import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { Response } from 'express';
import { isObject } from 'class-validator';
import type { CustomResponse } from '../dto/custom-response.dto.js';
import { SKIP_RESPONSE_INTERCEPTOR } from '../decorators/skip-response-interceptor.decorator.js';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    constructor(private readonly reflector: Reflector) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<CustomResponse<T> | T> {
        if (this.shouldSkipInterceptor(context)) {
            return next.handle();
        }

        return next
            .handle()
            .pipe(map((res: T) => this.transformResponse(res, context)));
    }

    private shouldSkipInterceptor(context: ExecutionContext): boolean {
        return this.reflector.getAllAndOverride<boolean>(
            SKIP_RESPONSE_INTERCEPTOR,
            [context.getHandler(), context.getClass()],
        );
    }

    private transformResponse(
        res: T,
        context: ExecutionContext,
    ): CustomResponse<T> | T {
        // Return as-is if already in correct format
        if (this.isCustomResponseFormat(res)) {
            return res;
        }

        const statusCode = context
            .switchToHttp()
            .getResponse<Response>().statusCode;
        const message = this.extractMessage(res);

        // Handle message-only responses
        if (this.isMessageOnly(res)) {
            return {
                statusCode,
                message: message || 'Success',
            };
        }

        // Check if response already has both data and metadata (paginated response)
        if (this.isPaginatedResponse(res)) {
            return {
                statusCode,
                message: message || 'Success',
                ...this.extractPaginatedResponse(res),
            } as CustomResponse<T>;
        }

        // Extract data and metadata for regular responses
        const data = this.extractData(res);
        const metadata = this.extractMetadata(res);

        return {
            statusCode,
            message: message || 'Success',
            ...(metadata && { metadata }),
            ...(data && { data }),
        } as CustomResponse<T>;
    }

    private isCustomResponseFormat(res: T): res is T & CustomResponse<T> {
        return (
            isObject(res) &&
            'statusCode' in (res as Record<string, unknown>) &&
            'message' in (res as Record<string, unknown>) &&
            typeof (res as Record<string, unknown>).statusCode === 'number' &&
            typeof (res as Record<string, unknown>).message === 'string'
        );
    }

    private isMessageOnly(res: T): boolean {
        if (!isObject(res)) {
            return true;
        }

        const keys = Object.keys(res as Record<string, unknown>);
        return (
            keys.length === 0 || (keys.length === 1 && keys[0] === 'message')
        );
    }

    private isPaginatedResponse(res: T): boolean {
        if (!isObject(res)) {
            return false;
        }

        const obj = res as Record<string, unknown>;
        return (
            'data' in obj &&
            Array.isArray(obj.data) &&
            'metadata' in obj &&
            isObject(obj.metadata)
        );
    }

    private extractPaginatedResponse(res: T): Record<string, unknown> {
        const obj = res as Record<string, unknown>;
        return {
            data: obj.data,
            metadata: obj.metadata,
        };
    }

    private extractMessage(res: T): string | undefined {
        if (!isObject(res)) {
            return undefined;
        }

        const msg = (res as Record<string, unknown>).message;
        return typeof msg === 'string' ? msg : undefined;
    }

    private extractMetadata(res: T): Record<string, unknown> | null {
        if (
            !isObject(res) ||
            this.isMessageOnly(res) ||
            !('metadata' in (res as Record<string, unknown>))
        ) {
            return null;
        }

        return (res as Record<string, unknown>).metadata as Record<
            string,
            unknown
        >;
    }

    private extractData(res: T): Record<string, unknown> | null {
        if (!isObject(res) || this.isMessageOnly(res)) {
            return null;
        }

        if ('data' in (res as Record<string, unknown>)) {
            return (res as Record<string, unknown>).data as Record<
                string,
                unknown
            >;
        }

        const data = { ...(res as Record<string, unknown>) };
        delete data.message;
        delete data.metadata;

        return Object.keys(data).length > 0 ? data : null;
    }
}
