import { jest } from '@jest/globals';
import { of } from 'rxjs';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext, CallHandler } from '@nestjs/common';
import { ResponseInterceptor } from '../response.interceptor.js';

describe('ResponseInterceptor', () => {
    let interceptor: ResponseInterceptor<any>;
    let reflectorMock: {
        getAllAndOverride: jest.Mock<any>;
    };

    const createMockExecutionContext = (): ExecutionContext =>
        ({
            getHandler: () => ({}),
            getClass: () => ({}),
            switchToHttp: () => ({
                getResponse: () => ({ statusCode: 200 }),
            }),
        }) as unknown as ExecutionContext;

    beforeEach(() => {
        reflectorMock = {
            getAllAndOverride: jest.fn<any>(),
        };
        interceptor = new ResponseInterceptor(
            reflectorMock as unknown as Reflector,
        );
    });

    it('should be defined', () => {
        expect(interceptor).toBeDefined();
    });

    it('should skip interception if marked with SKIP_RESPONSE_INTERCEPTOR', (done) => {
        reflectorMock.getAllAndOverride.mockReturnValue(true);
        const context = createMockExecutionContext();
        const callHandler: CallHandler = {
            handle: () => of({ raw: 'data' }),
        };

        interceptor.intercept(context, callHandler).subscribe((res) => {
            expect(res).toEqual({ raw: 'data' });
            done();
        });
    });

    it('should wrap plain data with message "Success" and data key', (done) => {
        reflectorMock.getAllAndOverride.mockReturnValue(false);
        const context = createMockExecutionContext();
        const callHandler: CallHandler = {
            handle: () => of({ id: 1, name: 'Item 1' }),
        };

        interceptor.intercept(context, callHandler).subscribe((res) => {
            expect(res).toEqual({
                message: 'Success',
                data: { id: 1, name: 'Item 1' },
            });
            done();
        });
    });

    it('should preserve existing message if present in response object', (done) => {
        reflectorMock.getAllAndOverride.mockReturnValue(false);
        const context = createMockExecutionContext();
        const callHandler: CallHandler = {
            handle: () => of({ message: 'Deleted successfully' }),
        };

        interceptor.intercept(context, callHandler).subscribe((res) => {
            expect(res).toEqual({ message: 'Deleted successfully' });
            done();
        });
    });
});
