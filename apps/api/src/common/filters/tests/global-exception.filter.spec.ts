import { jest } from '@jest/globals';
import { GlobalExceptionFilter } from '../global-exception.filter.js';
import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { AppLoggerService } from '../../../modules/logger/logger.service.js';
import { ClsService } from 'nestjs-cls';
import { ConfigService } from '@nestjs/config';

describe('GlobalExceptionFilter', () => {
    let filter: GlobalExceptionFilter;
    let loggerMock: {
        setContext: jest.Mock<any>;
        error: jest.Mock<any>;
        warn: jest.Mock<any>;
        debug: jest.Mock<any>;
    };
    let clsMock: {
        get: jest.Mock<any>;
    };
    let configMock: {
        get: jest.Mock<any>;
    };

    let responseMock: {
        status: jest.Mock<any>;
        json: jest.Mock<any>;
    };
    let requestMock: any;
    let hostMock: ArgumentsHost;

    beforeEach(() => {
        loggerMock = {
            setContext: jest.fn<any>(),
            error: jest.fn<any>(),
            warn: jest.fn<any>(),
            debug: jest.fn<any>(),
        };
        clsMock = {
            get: jest.fn<any>((key: string) => {
                if (key === 'traceId') return 'trace-123';
                if (key === 'startTime') return 0n;
                return undefined;
            }),
        };
        configMock = {
            get: jest.fn<any>(),
        };

        filter = new GlobalExceptionFilter(
            loggerMock as unknown as AppLoggerService,
            clsMock as unknown as ClsService<any>,
            configMock as unknown as ConfigService<any, true>,
        );

        responseMock = {
            status: jest.fn<any>().mockReturnThis(),
            json: jest.fn<any>(),
        };
        requestMock = {
            method: 'GET',
            originalUrl: '/test',
            url: '/test',
        };

        hostMock = {
            switchToHttp: () => ({
                getRequest: () => requestMock,
                getResponse: () => responseMock,
            }),
        } as unknown as ArgumentsHost;
    });

    it('should be defined', () => {
        expect(filter).toBeDefined();
    });

    it('should format HttpException into RFC9457 response', () => {
        const exception = new HttpException(
            'Forbidden resource',
            HttpStatus.FORBIDDEN,
        );

        filter.catch(exception, hostMock);

        expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
        expect(responseMock.json).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Forbidden',
                status: HttpStatus.FORBIDDEN,
                detail: 'Forbidden resource',
                instance: '/test',
                traceId: 'trace-123',
            }),
        );
        expect(loggerMock.warn).toHaveBeenCalled();
    });

    it('should format class-validator validation errors with field details', () => {
        const exception = new BadRequestException({
            message: [
                {
                    property: 'email',
                    constraints: {
                        isEmail: 'email must be an email',
                    },
                },
            ],
        });

        filter.catch(exception, hostMock);

        expect(responseMock.status).toHaveBeenCalledWith(
            HttpStatus.BAD_REQUEST,
        );
        expect(responseMock.json).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Validation Failed',
                status: HttpStatus.BAD_REQUEST,
                errors: [
                    {
                        field: 'email',
                        detail: 'email must be an email',
                    },
                ],
            }),
        );
    });

    it('should handle unhandled Error with 500 status and mask details in production', () => {
        configMock.get.mockReturnValue('production');
        const error = new Error('Secret database failure');

        filter.catch(error, hostMock);

        expect(responseMock.status).toHaveBeenCalledWith(
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect(responseMock.json).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Internal Server Error',
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                detail: 'An unexpected error occurred',
            }),
        );
        expect(loggerMock.error).toHaveBeenCalled();
    });
});
