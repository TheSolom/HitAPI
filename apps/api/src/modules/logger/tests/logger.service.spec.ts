import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INQUIRER } from '@nestjs/core';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ClsService } from 'nestjs-cls';
import { AppLoggerService } from '../logger.service.js';

describe('AppLoggerService', () => {
    let service: AppLoggerService;
    let winstonMock: {
        verbose: jest.Mock;
        debug: jest.Mock;
        info: jest.Mock;
        warn: jest.Mock;
        error: jest.Mock;
    };
    let clsMock: {
        getId: jest.Mock;
        get: jest.Mock;
    };

    class DummyParentClass {}

    beforeEach(async () => {
        winstonMock = {
            verbose: jest.fn(),
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };
        clsMock = {
            getId: jest.fn(() => 'cls-trace-id'),
            get: jest.fn(() => 'store-trace-id'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppLoggerService,
                {
                    provide: INQUIRER,
                    useValue: new DummyParentClass(),
                },
                {
                    provide: WINSTON_MODULE_PROVIDER,
                    useValue: winstonMock,
                },
                {
                    provide: ClsService,
                    useValue: clsMock,
                },
            ],
        }).compile();

        service = await module.resolve<AppLoggerService>(AppLoggerService);
    });

    it('should be defined and extract context from parent class', () => {
        expect(service).toBeDefined();
    });

    it('should log info messages with traceId from CLS', () => {
        service.info('Test info log');

        expect(winstonMock.info).toHaveBeenCalledWith(
            'Test info log',
            expect.objectContaining({
                context: 'AppLoggerService',
                traceId: 'cls-trace-id',
            }),
        );
    });

    it('should update context with setContext', () => {
        service.setContext('NewCustomContext');
        service.debug('Debug message');

        expect(winstonMock.debug).toHaveBeenCalledWith(
            'Debug message',
            expect.objectContaining({
                context: 'NewCustomContext',
            }),
        );
    });

    it('should support logging with string context override', () => {
        service.warn('Warning message', 'OverriddenContext');

        expect(winstonMock.warn).toHaveBeenCalledWith(
            'Warning message',
            expect.objectContaining({
                context: 'OverriddenContext',
            }),
        );
    });

    it('should support logging with Error instance', () => {
        const error = new Error('Test exception');
        service.error('Failed operation', error);

        expect(winstonMock.error).toHaveBeenCalledWith(
            'Failed operation',
            expect.objectContaining({
                error: error.stack,
            }),
        );
    });

    it('should delegate log to info', () => {
        service.log('Standard log message');

        expect(winstonMock.info).toHaveBeenCalledWith(
            'Standard log message',
            expect.any(Object),
        );
    });

    it('should log verbose messages', () => {
        service.verbose('Verbose message');

        expect(winstonMock.verbose).toHaveBeenCalledWith(
            'Verbose message',
            expect.any(Object),
        );
    });
});
