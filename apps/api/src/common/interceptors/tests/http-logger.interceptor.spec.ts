import { jest } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { HttpStatus } from '@nestjs/common';
import type { ExecutionContext, CallHandler } from '@nestjs/common';
import { HttpLoggerInterceptor } from '../http-logger.interceptor.js';
import { AppLoggerService } from '../../../modules/logger/logger.service.js';
import { ClsService } from 'nestjs-cls';

describe('HttpLoggerInterceptor', () => {
    let interceptor: HttpLoggerInterceptor;
    let loggerMock: {
        info: jest.Mock<any>;
        warn: jest.Mock<any>;
        error: jest.Mock<any>;
    };
    let clsMock: {
        get: jest.Mock<any>;
    };

    const createMockExecutionContext = (
        statusCode: number,
    ): { context: ExecutionContext; req: any; res: any } => {
        const req = {
            method: 'GET',
            originalUrl: '/test-route',
            user: { id: 'u1' },
            userApp: { id: 'app1' },
        };
        const res = { statusCode };
        const context = {
            switchToHttp: () => ({
                getRequest: () => req,
                getResponse: () => res,
            }),
        } as unknown as ExecutionContext;

        return { context, req, res };
    };

    beforeEach(() => {
        loggerMock = {
            info: jest.fn<any>(),
            warn: jest.fn<any>(),
            error: jest.fn<any>(),
        };
        clsMock = {
            get: jest.fn<any>((key: string) => {
                if (key === 'startTime') return 0n;
                if (key === 'ip') return '127.0.0.1';
                if (key === 'userAgent') return 'Jest';
                return undefined;
            }),
        };

        interceptor = new HttpLoggerInterceptor(
            loggerMock as unknown as AppLoggerService,
            clsMock as unknown as ClsService<any>,
        );
    });

    it('should be defined', () => {
        expect(interceptor).toBeDefined();
    });

    it('should log info for successful 200 response', (done) => {
        const { context } = createMockExecutionContext(HttpStatus.OK);
        const callHandler: CallHandler = {
            handle: () => of({ success: true }),
        };

        interceptor.intercept(context, callHandler).subscribe({
            next: () => {
                expect(loggerMock.info).toHaveBeenCalledWith(
                    expect.stringContaining('GET /test-route 200'),
                    expect.objectContaining({
                        statusCode: 200,
                        userId: 'u1',
                        userApp: 'app1',
                    }),
                );
                done();
            },
        });
    });

    it('should log warn for 4xx client error response', (done) => {
        const { context, res } = createMockExecutionContext(
            HttpStatus.BAD_REQUEST,
        );
        const callHandler: CallHandler = {
            handle: () => {
                res.statusCode = HttpStatus.BAD_REQUEST;
                return throwError(() => new Error('Client error'));
            },
        };

        interceptor.intercept(context, callHandler).subscribe({
            error: () => {
                expect(loggerMock.warn).toHaveBeenCalledWith(
                    expect.stringContaining('GET /test-route 400'),
                    expect.any(Object),
                );
                done();
            },
        });
    });

    it('should log error for 5xx server error response', (done) => {
        const { context, res } = createMockExecutionContext(
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
        const callHandler: CallHandler = {
            handle: () => {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                return throwError(() => new Error('Fatal error'));
            },
        };

        interceptor.intercept(context, callHandler).subscribe({
            error: () => {
                expect(loggerMock.error).toHaveBeenCalledWith(
                    expect.stringContaining('GET /test-route 500'),
                    expect.any(Object),
                );
                done();
            },
        });
    });
});
