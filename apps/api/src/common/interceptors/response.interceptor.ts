import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { isObject } from 'class-validator';
import type { Response } from 'express';
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

        return next.handle().pipe(map((res: T) => this.formatResponse(res)));
    }

    private shouldSkipInterceptor(context: ExecutionContext): boolean {
        return this.reflector.getAllAndOverride<boolean>(
            SKIP_RESPONSE_INTERCEPTOR,
            [context.getHandler(), context.getClass()],
        );
    }

    private formatResponse(res: T): CustomResponse<T> | T {
        if (this.isAlreadyFormatted(res)) {
            return res;
        }

        const message = this.extractMessage(res);

        if (this.isMessageOnly(res)) {
            return { message: message || 'Success' };
        }

        const { data, metadata } = this.extractDataAndMetadata(res);

        return {
            message: message || 'Success',
            ...(metadata && { metadata }),
            ...(data && { data }),
        } as CustomResponse<T>;
    }

    private isAlreadyFormatted(res: T): res is T & CustomResponse<T> {
        if (!isObject(res)) return false;

        const obj = res as Record<string, unknown>;
        return 'message' in obj && typeof obj.message === 'string';
    }

    private getStatusCode(context: ExecutionContext): number {
        return context.switchToHttp().getResponse<Response>().statusCode;
    }

    private extractMessage(res: T): string | undefined {
        if (!isObject(res)) return undefined;

        const msg = (res as Record<string, unknown>).message;
        return typeof msg === 'string' ? msg : undefined;
    }

    private isMessageOnly(res: T): boolean {
        if (!isObject(res) || Array.isArray(res)) {
            return false;
        }

        const keys = Object.keys(res as Record<string, unknown>);
        return (
            keys.length === 0 || (keys.length === 1 && keys[0] === 'message')
        );
    }

    private extractDataAndMetadata(res: T): {
        data: Array<unknown> | null;
        metadata: Record<string, unknown> | null;
    } {
        const metadata = this.extractMetadata(res);
        const data = this.extractData(res);

        return { data, metadata };
    }

    private extractMetadata(res: T): Record<string, unknown> | null {
        if (!isObject(res) || this.isMessageOnly(res)) {
            return null;
        }

        const obj = res as Record<string, unknown>;
        return 'metadata' in obj && isObject(obj.metadata)
            ? (obj.metadata as Record<string, unknown>)
            : null;
    }

    private extractData(res: T): Array<unknown> | null {
        if (Array.isArray(res)) {
            return res;
        }

        if (!isObject(res) || this.isMessageOnly(res)) {
            return null;
        }

        const obj = res as Record<string, unknown>;

        if ('data' in obj) {
            return Array.isArray(obj.data)
                ? (obj.data as Array<unknown>)
                : [obj.data];
        }

        const data = { ...obj };
        delete data.message;
        delete data.metadata;

        return Object.keys(data).length > 0 ? [data] : null;
    }
}
