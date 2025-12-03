import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Response } from 'express';
import type { CustomResponse } from '../dto/custom-response.dto.js';
import { Reflector } from '@nestjs/core';
import { SKIP_RESPONSE_INTERCEPTOR } from '../decorators/skip-response-interceptor.decorator.js';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    constructor(private readonly reflector: Reflector) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<CustomResponse<T> | T> {
        const skipResponseInterceptor =
            this.reflector.getAllAndOverride<boolean>(
                SKIP_RESPONSE_INTERCEPTOR,
                [context.getHandler(), context.getClass()],
            );
        if (skipResponseInterceptor) {
            return next.handle();
        }

        return next.handle().pipe(
            map((res: T) => {
                const ctx = context.switchToHttp();
                const response = ctx.getResponse<Response>();

                // If data is already in the correct format, return it
                if (this.isCustomResponseFormat(res)) {
                    return res;
                }

                // Extract message if it exists in the data object
                const message = this.extractMessage(res);

                // Check if response only contains message (or is empty)
                if (this.isMessageOnly(res)) {
                    return {
                        statusCode: response.statusCode,
                        message: message || 'Success',
                    };
                }

                // If res contains message + other properties, separate them
                if (res && typeof res === 'object' && 'message' in res) {
                    const dataWithoutMessage =
                        this.removeMessageFromObject(res);
                    if (Object.keys(dataWithoutMessage).length > 0) {
                        return {
                            statusCode: response.statusCode,
                            message: message || 'Success',
                            data: dataWithoutMessage as T,
                        };
                    }
                }

                // Return with data field for everything else
                if (res !== null && res !== undefined) {
                    return {
                        statusCode: response.statusCode,
                        message: message || 'Success',
                        data: res,
                    };
                }

                // Return without data field for null/undefined
                return {
                    statusCode: response.statusCode,
                    message: message || 'Success',
                };
            }),
        );
    }

    private isCustomResponseFormat(res: T): res is T & CustomResponse<T> {
        return (
            res !== null &&
            typeof res === 'object' &&
            'statusCode' in res &&
            'message' in res &&
            typeof (res as Record<string, unknown>).statusCode === 'number' &&
            typeof (res as Record<string, unknown>).message === 'string'
        );
    }

    private extractMessage(res: T): string | undefined {
        if (res && typeof res === 'object' && 'message' in res) {
            const msg = (res as Record<string, unknown>).message;
            return typeof msg === 'string' ? msg : undefined;
        }
        return undefined;
    }

    private isMessageOnly(res: T): boolean {
        if (!res || typeof res !== 'object') {
            return true;
        }
        const keys = Object.keys(res as Record<string, unknown>);
        return (
            keys.length === 0 || (keys.length === 1 && keys[0] === 'message')
        );
    }

    private removeMessageFromObject(res: T): Record<string, unknown> {
        if (!res || typeof res !== 'object') {
            return {};
        }
        const obj = { ...(res as Record<string, unknown>) };
        delete obj.message;
        return obj;
    }
}
